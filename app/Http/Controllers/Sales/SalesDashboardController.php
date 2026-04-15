<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\Customer;
use App\Models\Sales\Quotation;
use App\Models\Sales\SalesOrder;
use App\Models\Sales\Invoice;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesDashboardController extends Controller
{
    /**
     * Display the sales dashboard
     */
    public function index()
    {
        $user = auth()->user();
        $comp_id = $user->comp_id;

        // Get KPIs
        $currentMonth = now()->format('Y-m');
        
        $totalSalesThisMonth = SalesOrder::where('comp_id', $comp_id)
            ->whereYear('order_date', now()->year)
            ->whereMonth('order_date', now()->month)
            ->sum('amount_total_base');

        $totalInvoicedThisMonth = Invoice::where('comp_id', $comp_id)
            ->whereYear('invoice_date', now()->year)
            ->whereMonth('invoice_date', now()->month)
            ->sum('amount_total_base');

        $totalOutstandingAR = Invoice::where('comp_id', $comp_id)
            ->where('payment_status', '!=', 'paid')
            ->sum('outstanding_amount');

        $activeCustomers = Customer::where('comp_id', $comp_id)
            ->where('active_status', true)
            ->count();

        $pendingQuotes = Quotation::where('comp_id', $comp_id)
            ->where('state', 'draft')
            ->count();

        $overdueSalesOrders = SalesOrder::where('comp_id', $comp_id)
            ->where('state', '!=', 'closed')
            ->where('commitment_date', '<', now())
            ->count();

        // Get recent data
        $recentOrders = SalesOrder::with('customer')
            ->where('comp_id', $comp_id)
            ->orderBy('order_date', 'desc')
            ->limit(10)
            ->get();

        $recentInvoices = Invoice::with('customer')
            ->where('comp_id', $comp_id)
            ->orderBy('invoice_date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Sales/Dashboard', [
            'kpis' => [
                'total_sales_this_month' => $totalSalesThisMonth,
                'total_invoiced_this_month' => $totalInvoicedThisMonth,
                'total_outstanding_ar' => $totalOutstandingAR,
                'active_customers' => $activeCustomers,
                'pending_quotes' => $pendingQuotes,
                'overdue_sales_orders' => $overdueSalesOrders,
            ],
            'recent_orders' => $recentOrders,
            'recent_invoices' => $recentInvoices,
        ]);
    }
}
