<?php
/**
 * Email Queue Processor
 * Run this every minute via cron job
 * 
 * Cron command:
 * * * * * * php /path/to/backend/cron/process_email_queue.php >> /var/log/email_queue.log 2>&1
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/EmailHelper.php';

class EmailQueueProcessor {
    private $db;
    private $emailHelper;
    private $batchSize = 10;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->emailHelper = new EmailHelper($this->db);
    }
    
    public function process() {
        echo date('Y-m-d H:i:s') . " - Starting email queue processor\n";
        
        // Get pending emails
        $sql = "SELECT * FROM email_queue 
                WHERE status = 'pending' 
                AND retry_count < 3
                ORDER BY created_at ASC 
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $this->batchSize, PDO::PARAM_INT);
        $stmt->execute();
        $emails = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($emails)) {
            echo "No pending emails to process\n";
            return;
        }
        
        echo "Found " . count($emails) . " emails to process\n";
        
        foreach ($emails as $email) {
            $this->processEmail($email);
        }
        
        echo "Finished processing batch\n";
    }
    
    private function processEmail($email) {
        echo "Processing email ID: {$email['id']} to: {$email['recipient_email']}\n";
        
        try {
            // Decode variables
            $variables = json_decode($email['variables'], true);
            
            // Send email
            $result = $this->emailHelper->sendEmail(
                $email['recipient_email'],
                $email['template_key'],
                $variables
            );
            
            if ($result['success']) {
                // Mark as sent
                $sql = "UPDATE email_queue 
                        SET status = 'sent', 
                            sent_at = NOW() 
                        WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':id' => $email['id']]);
                
                echo "✓ Email sent successfully for ID: {$email['id']}\n";
            } else {
                // Failed to send
                $this->handleFailure($email, $result['message']);
            }
            
        } catch (Exception $e) {
            $this->handleFailure($email, $e->getMessage());
        }
    }
    
    private function handleFailure($email, $error) {
        $newRetryCount = $email['retry_count'] + 1;
        
        if ($newRetryCount >= 3) {
            // Permanent failure after 3 retries
            $sql = "UPDATE email_queue 
                    SET status = 'failed', 
                        retry_count = :retry_count,
                        error_message = :error
                    WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':retry_count' => $newRetryCount,
                ':error' => $error,
                ':id' => $email['id']
            ]);
            
            echo "✗ Email permanently failed for ID: {$email['id']} after 3 retries\n";
            
            // Log to error log for admin attention
            error_log("EMAIL QUEUE: Permanent failure for email ID {$email['id']} to {$email['recipient_email']}: $error");
        } else {
            // Will retry later
            $sql = "UPDATE email_queue 
                    SET retry_count = :retry_count,
                        error_message = :error
                    WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':retry_count' => $newRetryCount,
                ':error' => $error,
                ':id' => $email['id']
            ]);
            
            echo "⚠ Email failed (attempt {$newRetryCount}/3) for ID: {$email['id']}. Will retry later.\n";
        }
    }
}

// Run the processor if called from command line
if (php_sapi_name() === 'cli') {
    $processor = new EmailQueueProcessor();
    $processor->process();
} else {
    header('HTTP/1.0 403 Forbidden');
    die('Access denied');
}
?>