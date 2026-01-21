import React, { useState } from 'react';
import {
    Box,
    Card,
    Grid,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField,
    SelectChangeEvent
} from '@mui/material';
import {
    DatePicker,
    LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id } from 'date-fns/locale';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../../services/reportService';
import ReportChart from '../../components/Admin/ReportChart';

interface ReportData {
    date: string;
    revenue: number;
    orders: number;
    users: number;
}

interface CategoryData {
    name: string;
    value: number;
}

interface SalesData {
    date: string;
    sales: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage: React.FC = () => {
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
    });
    const [chartType, setChartType] = useState('bar');

    // Fetch sales report
    const { data: salesReport, isLoading: salesLoading } = useQuery({
        queryKey: ['salesReport', dateRange],
        queryFn: () => reportService.getSalesReport({
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
        }),
        enabled: reportType === 'sales'
    });

    // Fetch category report
    const { data: categoryReport, isLoading: categoryLoading } = useQuery({
        queryKey: ['categoryReport', dateRange],
        queryFn: () => reportService.getCategoryReport({
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
        }),
        enabled: reportType === 'categories'
    });

    // Fetch top products
    const { data: topProducts, isLoading: productsLoading } = useQuery({
        queryKey: ['topProducts', dateRange],
        queryFn: () => reportService.getTopProducts({
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString(),
            limit: 10
        })
    });

    const handleReportTypeChange = (event: SelectChangeEvent) => {
        setReportType(event.target.value);
    };

    const handleChartTypeChange = (event: SelectChangeEvent) => {
        setChartType(event.target.value);
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: Date | null) => {
        if (value) {
            setDateRange(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleExport = (format: 'pdf' | 'excel') => {
        reportService.exportReport({
            type: reportType,
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString(),
            format
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const renderSalesChart = () => {
        if (!salesReport || salesReport.length === 0) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <Typography>Tidak ada data penjualan untuk periode ini</Typography>
                </Box>
            );
        }

        if (chartType === 'bar') {
            return (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={salesReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis
                            tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}JT`}
                        />
                        <Tooltip
                            formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="Pendapatan" fill="#8884d8" />
                        <Bar dataKey="orders" name="Jumlah Pesanan" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                        tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}JT`}
                    />
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Pendapatan"
                        stroke="#8884d8"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="orders"
                        name="Jumlah Pesanan"
                        stroke="#82ca9d"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    const renderCategoryChart = () => {
        if (!categoryReport || categoryReport.length === 0) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <Typography>Tidak ada data kategori untuk periode ini</Typography>
                </Box>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={categoryReport}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {categoryReport.map((entry: CategoryData, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Pendapatan']} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Laporan & Analytics
                </Typography>

                {/* Filters */}
                <Card sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Jenis Laporan</InputLabel>
                                <Select
                                    value={reportType}
                                    label="Jenis Laporan"
                                    onChange={handleReportTypeChange}
                                >
                                    <MenuItem value="sales">Penjualan</MenuItem>
                                    <MenuItem value="categories">Kategori</MenuItem>
                                    <MenuItem value="products">Produk</MenuItem>
                                    <MenuItem value="users">Pengguna</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <DatePicker
                                label="Dari Tanggal"
                                value={dateRange.startDate}
                                onChange={(date) => handleDateChange('startDate', date)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <DatePicker
                                label="Sampai Tanggal"
                                value={dateRange.endDate}
                                onChange={(date) => handleDateChange('endDate', date)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Box display="flex" gap={1}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleExport('pdf')}
                                    fullWidth
                                >
                                    PDF
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleExport('excel')}
                                    fullWidth
                                >
                                    Excel
                                </Button>
                            </Box>
                        </Grid>

                        {reportType === 'sales' && (
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipe Grafik</InputLabel>
                                    <Select
                                        value={chartType}
                                        label="Tipe Grafik"
                                        onChange={handleChartTypeChange}
                                    >
                                        <MenuItem value="bar">Bar Chart</MenuItem>
                                        <MenuItem value="line">Line Chart</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </Card>

                {/* Charts */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={reportType === 'categories' ? 12 : 8}>
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                {reportType === 'sales' && 'Laporan Penjualan'}
                                {reportType === 'categories' && 'Distribusi Kategori'}
                                {reportType === 'products' && 'Produk Terlaris'}
                                {reportType === 'users' && 'Analisis Pengguna'}
                            </Typography>

                            {reportType === 'sales' && renderSalesChart()}
                            {reportType === 'categories' && renderCategoryChart()}
                        </Card>
                    </Grid>

                    {reportType === 'sales' && (
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Ringkasan
                                </Typography>

                                {salesReport && salesReport.length > 0 && (
                                    <Box>
                                        <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Total Pendapatan
                                            </Typography>
                                            <Typography variant="h5">
                                                {formatCurrency(
                                                    salesReport.reduce((sum: number, item: ReportData) => sum + item.revenue, 0)
                                                )}
                                            </Typography>
                                        </Paper>

                                        <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Total Pesanan
                                            </Typography>
                                            <Typography variant="h5">
                                                {salesReport.reduce((sum: number, item: ReportData) => sum + item.orders, 0)}
                                            </Typography>
                                        </Paper>

                                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Rata-rata Pesanan
                                            </Typography>
                                            <Typography variant="h5">
                                                {formatCurrency(
                                                    salesReport.reduce((sum: number, item: ReportData) => sum + item.revenue, 0) /
                                                    salesReport.reduce((sum: number, item: ReportData) => sum + item.orders, 1)
                                                )}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    )}

                    {/* Top Products Table */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                10 Produk Terlaris
                            </Typography>

                            {topProducts && topProducts.length > 0 ? (
                                <Box sx={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                <th style={{ padding: '12px', textAlign: 'left' }}>Produk</th>
                                                <th style={{ padding: '12px', textAlign: 'center' }}>Terjual</th>
                                                <th style={{ padding: '12px', textAlign: 'right' }}>Pendapatan</th>
                                                <th style={{ padding: '12px', textAlign: 'right' }}>Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((product: any, index: number) => (
                                                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px' }}>
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <Typography variant="body2" color="textSecondary">
                                                                #{index + 1}
                                                            </Typography>
                                                            <Typography>{product.name}</Typography>
                                                        </Box>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        {product.quantitySold}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                                        {formatCurrency(product.revenue)}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                                        {product.averageRating?.toFixed(1) || '-'}/5
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            ) : (
                                <Typography>Belum ada data produk terlaris</Typography>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default ReportsPage;
