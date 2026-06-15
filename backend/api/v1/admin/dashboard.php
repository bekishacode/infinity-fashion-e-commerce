<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$period = $_GET['period'] ?? 'week';

if ($method !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

try {
    // Set date condition based on period
    if ($period === 'today') {
        $dateCondition = "DATE(o.created_at) = CURDATE()";
        $trendDateCondition = "o.created_at >= NOW() - INTERVAL 30 DAY";
    } else {
        $dateRange = match($period) {
            'week' => 'INTERVAL 7 DAY',
            'month' => 'INTERVAL 30 DAY',
            'year' => 'INTERVAL 365 DAY',
            default => 'INTERVAL 7 DAY'
        };
        $dateCondition = "o.created_at >= NOW() - $dateRange";
        $trendDateCondition = "o.created_at >= NOW() - INTERVAL 30 DAY";
    }

    // For queries without joins, use simple condition
    $simpleDateCondition = str_replace('o.', '', $dateCondition);
    $simpleTrendCondition = str_replace('o.', '', $trendDateCondition);

    // 1. Summary Statistics
    $summarySql = "SELECT 
                        COALESCE(SUM(total_amount), 0) as total_revenue,
                        COUNT(*) as total_orders,
                        COUNT(DISTINCT customer_id) as total_customers,
                        COUNT(DISTINCT product_id) as total_products,
                        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
                        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                        COALESCE(AVG(total_amount), 0) as avg_order_value
                    FROM orders 
                    WHERE $simpleDateCondition";
    $summaryStmt = $db->query($summarySql);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    // 2. Sales by Day (for chart)
    if ($period === 'today') {
        $salesSql = "SELECT 
                        HOUR(created_at) as hour,
                        COUNT(*) as orders,
                        COALESCE(SUM(total_amount), 0) as revenue
                    FROM orders 
                    WHERE DATE(created_at) = CURDATE()
                    GROUP BY HOUR(created_at)
                    ORDER BY hour ASC";
        $salesStmt = $db->query($salesSql);
        $salesByHour = $salesStmt->fetchAll(PDO::FETCH_ASSOC);
        $salesByDay = [];
    } else {
        $salesSql = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as orders,
                        COALESCE(SUM(total_amount), 0) as revenue
                    FROM orders 
                    WHERE $simpleDateCondition
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC";
        $salesStmt = $db->query($salesSql);
        $salesByDay = $salesStmt->fetchAll(PDO::FETCH_ASSOC);
        $salesByHour = [];
    }

    // 3. Sales by Service Type
    $serviceSql = "SELECT 
                        service_type,
                        COUNT(*) as count,
                        COALESCE(SUM(total_amount), 0) as revenue
                    FROM orders 
                    WHERE $simpleDateCondition
                    GROUP BY service_type";
    $serviceStmt = $db->query($serviceSql);
    $salesByServiceType = $serviceStmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Order Status Distribution
    $statusSql = "SELECT 
                        status,
                        COUNT(*) as count
                    FROM orders 
                    WHERE $simpleDateCondition
                    GROUP BY status";
    $statusStmt = $db->query($statusSql);
    $orderStatusDistribution = $statusStmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Recent Orders
    $recentSql = "SELECT 
                        id, order_number, customer_name, customer_email, total_amount, status, created_at
                    FROM orders 
                    ORDER BY created_at DESC 
                    LIMIT 10";
    $recentStmt = $db->query($recentSql);
    $recentOrders = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Top Products
    $topProductsSql = "SELECT 
                        product_id as id, 
                        product_name as name,
                        SUM(quantity) as total_sold,
                        COALESCE(SUM(total_amount), 0) as revenue
                    FROM orders 
                    WHERE $simpleDateCondition
                    GROUP BY product_id, product_name
                    ORDER BY total_sold DESC
                    LIMIT 5";
    $topProductsStmt = $db->query($topProductsSql);
    $topProducts = $topProductsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. Top Customers - Fixed ambiguous column
    $topCustomersSql = "SELECT 
                            c.id, 
                            c.name, 
                            c.email,
                            c.phone,
                            COUNT(o.id) as total_orders,
                            COALESCE(SUM(o.total_amount), 0) as total_spent
                        FROM customers c
                        LEFT JOIN orders o ON c.id = o.customer_id AND $dateCondition
                        GROUP BY c.id
                        ORDER BY total_spent DESC
                        LIMIT 5";
    $topCustomersStmt = $db->query($topCustomersSql);
    $topCustomers = $topCustomersStmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. Monthly Trends
    $monthlyTrendsSql = "SELECT 
                            DATE_FORMAT(created_at, '%Y-%m') as month,
                            COUNT(*) as orders,
                            COALESCE(SUM(total_amount), 0) as revenue
                        FROM orders 
                        WHERE $simpleTrendCondition
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                        ORDER BY month ASC";
    $monthlyTrendsStmt = $db->query($monthlyTrendsSql);
    $monthlyTrends = $monthlyTrendsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 9. Peak Order Hours
    $hourlySql = "SELECT 
                        HOUR(created_at) as hour,
                        COUNT(*) as orders
                    FROM orders 
                    WHERE $simpleTrendCondition
                    GROUP BY HOUR(created_at)
                    ORDER BY hour ASC";
    $hourlyStmt = $db->query($hourlySql);
    $hourlyDistribution = $hourlyStmt->fetchAll(PDO::FETCH_ASSOC);

    // 10. Average processing time
    $avgProcessingSql = "SELECT 
                            AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_processing_hours
                        FROM orders 
                        WHERE status IN ('delivered', 'shipped') 
                        AND $simpleDateCondition";
    $avgProcessingStmt = $db->query($avgProcessingSql);
    $avgProcessingTime = $avgProcessingStmt->fetch(PDO::FETCH_ASSOC);

    // Prepare response
    $response = [
        'summary' => [
            'totalRevenue' => (float)$summary['total_revenue'],
            'totalOrders' => (int)$summary['total_orders'],
            'totalCustomers' => (int)$summary['total_customers'],
            'totalProducts' => (int)$summary['total_products'],
            'pendingOrders' => (int)$summary['pending_orders'],
            'completedOrders' => (int)$summary['completed_orders'],
            'cancelledOrders' => (int)$summary['cancelled_orders'],
            'averageOrderValue' => (float)$summary['avg_order_value'],
            'avgProcessingHours' => round($avgProcessingTime['avg_processing_hours'] ?? 0, 1)
        ],
        'salesByDay' => $salesByDay,
        'salesByHour' => $salesByHour,
        'salesByServiceType' => $salesByServiceType,
        'orderStatusDistribution' => $orderStatusDistribution,
        'recentOrders' => $recentOrders,
        'topProducts' => $topProducts,
        'topCustomers' => $topCustomers,
        'monthlyTrends' => $monthlyTrends,
        'hourlyDistribution' => $hourlyDistribution,
        'period' => $period
    ];

    sendResponse(true, 'Dashboard data retrieved', $response);

} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>