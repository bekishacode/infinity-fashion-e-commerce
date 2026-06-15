<?php
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailHelper {
    private $db;
    private $config;
    
    public function __construct($db) {
        $this->db = $db;
        $this->loadConfig();
    }
    
    private function loadConfig() {
        $sql = "SELECT * FROM email_config LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $this->config = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function sendEmail($to, $templateKey, $variables = [], $customerId = null, $orderId = null) {
        // Get template with header, body, and footer
        $sql = "SELECT * FROM email_templates WHERE template_key = :key AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':key' => $templateKey]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$template) {
            throw new Exception("Template '$templateKey' not found");
        }
        
        // Add year variable for footer
        $variables['year'] = date('Y');
        
        // Replace variables in subject
        $subject = $this->replaceVariables($template['subject'], $variables);
        
        // Build complete email body: header + body + footer
        $header = $template['header'] ?? '';
        $body = $template['body'] ?? '';
        $footer = $template['footer'] ?? '';
        
        // Replace variables in each section
        $header = $this->replaceVariables($header, $variables);
        $body = $this->replaceVariables($body, $variables);
        $footer = $this->replaceVariables($footer, $variables);
        
        // Combine everything into a complete HTML document
        $fullBody = $this->buildEmailHTML($header, $body, $footer);
        
        $mail = new PHPMailer(true);
        
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = $this->config['smtp_host'] ?? 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $this->config['smtp_username'] ?? '';
            $mail->Password   = $this->config['smtp_password'] ?? '';
            $mail->SMTPSecure = $this->config['smtp_encryption'] ?? PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $this->config['smtp_port'] ?? 587;
            
            // Recipients
            $mail->setFrom($this->config['from_email'], $this->config['from_name']);
            $mail->addAddress($to);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $fullBody;
            $mail->AltBody = strip_tags($body); // Plain text version without header/footer
            
            $mail->send();
            $this->logEmail($to, $templateKey, $subject, 'sent');
            return ['success' => true, 'message' => 'Email sent successfully'];
            
        } catch (Exception $e) {
            $this->logEmail($to, $templateKey, $subject, 'failed', $mail->ErrorInfo);
            return ['success' => false, 'message' => $mail->ErrorInfo];
        }
    }
    
    private function buildEmailHTML($header, $body, $footer) {
        return '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    margin: 0;
                    padding: 20px 0;  /* Add vertical padding to body */
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;  /* Optional: adds rounded corners */
                    overflow: hidden;     /* Keeps rounded corners with gradient */
                }
            </style>
        </head>
        <body style="margin: 0; padding: 20px 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                ' . $header . '
                <div style="padding: 20px;">
                    ' . $body . '
                </div>
                ' . $footer . '
            </div>
        </body>
        </html>';
    }
    
    private function replaceVariables($text, $variables) {
        foreach ($variables as $key => $value) {
            $text = str_replace("{{" . $key . "}}", $value, $text);
        }
        return $text;
    }
    
    private function logEmail($to, $templateKey, $subject, $status, $error = null) {
        $sql = "INSERT INTO email_logs (recipient_email, template_key, subject, status, error_message, sent_at) 
                VALUES (:to, :template_key, :subject, :status, :error, IF(:status = 'sent', NOW(), NULL))";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':to' => $to,
            ':template_key' => $templateKey,
            ':subject' => $subject,
            ':status' => $status,
            ':error' => $error
        ]);
    }
}
?>