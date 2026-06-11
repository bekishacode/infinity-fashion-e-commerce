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
    
    public function sendEmail($to, $templateKey, $variables = []) {
        // Get template
        $sql = "SELECT * FROM email_templates WHERE template_key = :key AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':key' => $templateKey]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$template) {
            throw new Exception("Template '$templateKey' not found");
        }
        
        // Replace variables
        $subject = $this->replaceVariables($template['subject'], $variables);
        $body = $this->replaceVariables($template['body'], $variables);
        
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
            $mail->Body    = $body;
            $mail->AltBody = strip_tags($body);
            
            $mail->send();
            return ['success' => true, 'message' => 'Email sent successfully'];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => $mail->ErrorInfo];
        }
    }
    
    private function replaceVariables($text, $variables) {
        foreach ($variables as $key => $value) {
            $text = str_replace("{{" . $key . "}}", $value, $text);
        }
        return $text;
    }
}
?>