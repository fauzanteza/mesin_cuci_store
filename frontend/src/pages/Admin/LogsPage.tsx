import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    SelectChangeEvent
} from '@mui/material';
import {
    Search,
    FilterList,
    Refresh,
    Delete,
    Visibility,
    Warning,
    CheckCircle,
    Error,
    Info,
    DateRange
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { id } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import adminService from '../../services/adminService';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    source: string;
    userId?: string;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
}

const LogsPage: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({
        start: null,
        end: null
    });
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    // Fetch logs
    const { data: logsData, isLoading, refetch } = useQuery({
        queryKey: ['logs', page, rowsPerPage, searchQuery, levelFilter, sourceFilter, dateRange],
        queryFn: () => adminService.getLogs({
            page: page + 1,
            limit: rowsPerPage,
            search: searchQuery,
            level: levelFilter !== 'all' ? levelFilter : undefined,
            source: sourceFilter !== 'all' ? sourceFilter : undefined,
            startDate: dateRange.start?.toISOString(),
            endDate: dateRange.end?.toISOString()
        })
    });

    const logs = logsData?.data || [];
    const total = logsData?.total || 0;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleLevelFilterChange = (event: SelectChangeEvent) => {
        setLevelFilter(event.target.value);
        setPage(0);
    };

    const handleSourceFilterChange = (event: SelectChangeEvent) => {
        setSourceFilter(event.target.value);
        setPage(0);
    };

    const handleSearch = () => {
        setPage(0);
        refetch();
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setLevelFilter('all');
        setSourceFilter('all');
        setDateRange({ start: null, end: null });
        setPage(0);
    };

    const handleViewLog = (log: LogEntry) => {
        setSelectedLog(log);
        setViewDialogOpen(true);
    };

    const handleDeleteLog = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus log ini?')) {
            // Implement delete functionality
            console.log('Delete log:', id);
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error':
                return <Error color="error" />;
            case 'warning':
                return <Warning color="warning" />;
            case 'success':
                return <CheckCircle color="success" />;
            case 'info':
            default:
                return <Info color="info" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'success':
                return 'success';
            case 'info':
            default:
                return 'info';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const sources = Array.from(new Set(logs.map(log => log.source)));
    const levels = ['info', 'warning', 'error', 'success'];

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
            <Box>
                <Container maxWidth="xl">
                    {/* Header */}
                    <Box mb={4}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Log Aktivitas Sistem
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Pantau dan kelola log sistem untuk debugging dan audit
                        </Typography>
                    </Box>

                    {/* Filters */}
                    <Card sx={{ p: 3, mb: 4 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    placeholder="Cari pesan atau pengguna..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Level</InputLabel>
                                    <Select
                                        value={levelFilter}
                                        label="Level"
                                        onChange={handleLevelFilterChange}
                                    >
                                        <MenuItem value="all">Semua Level</MenuItem>
                                        {levels.map((level) => (
                                            <MenuItem key={level} value={level}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getLevelIcon(level)}
                                                    {level.toUpperCase()}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Sumber</InputLabel>
                                    <Select
                                        value={sourceFilter}
                                        label="Sumber"
                                        onChange={handleSourceFilterChange}
                                    >
                                        <MenuItem value="all">Semua Sumber</MenuItem>
                                        {sources.map((source) => (
                                            <MenuItem key={source} value={source}>
                                                {source}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <DatePicker
                                    label="Dari Tanggal"
                                    value={dateRange.start}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <DatePicker
                                    label="Sampai Tanggal"
                                    value={dateRange.end}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={1}>
                                <Box display="flex" gap={1}>
                                    <Tooltip title="Cari">
                                        <Button
                                            variant="contained"
                                            onClick={handleSearch}
                                            disabled={isLoading}
                                        >
                                            <FilterList />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Reset">
                                        <Button
                                            variant="outlined"
                                            onClick={handleResetFilters}
                                        >
                                            <Refresh />
                                        </Button>
                                    </Tooltip>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Stats */}
                    <Grid container spacing={3} mb={4}>
                        {[
                            { label: 'Total Log', value: total, color: 'primary' as const },
                            { label: 'Error', value: logs.filter((l: LogEntry) => l.level === 'error').length, color: 'error' as const },
                            { label: 'Warning', value: logs.filter((l: LogEntry) => l.level === 'warning').length, color: 'warning' as const },
                            { label: 'Info', value: logs.filter((l: LogEntry) => l.level === 'info').length, color: 'info' as const },
                            { label: 'Success', value: logs.filter((l: LogEntry) => l.level === 'success').length, color: 'success' as const }
                        ].map((stat, index) => (
                            <Grid item xs={12} sm={6} md={2.4} key={index}>
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="h4" color={stat.color} gutterBottom>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {stat.label}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Logs Table */}
                    <Card>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="80">Level</TableCell>
                                        <TableCell width="180">Waktu</TableCell>
                                        <TableCell width="150">Sumber</TableCell>
                                        <TableCell width="150">Pengguna</TableCell>
                                        <TableCell>Pesan</TableCell>
                                        <TableCell width="100">IP</TableCell>
                                        <TableCell width="120">Aksi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                Memuat data...
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                Tidak ada log yang ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id} hover>
                                                <TableCell>
                                                    <Chip
                                                        icon={getLevelIcon(log.level)}
                                                        label={log.level.toUpperCase()}
                                                        color={getLevelColor(log.level) as any}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(log.timestamp)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={log.source} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell>
                                                    {log.userName ? (
                                                        <Box>
                                                            <Typography variant="body2">{log.userName}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {log.userId}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            System
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={log.message}>
                                                        <Typography variant="body2">
                                                            {truncateText(log.message, 80)}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" fontFamily="monospace">
                                                        {log.ipAddress || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" gap={1}>
                                                        <Tooltip title="Lihat Detail">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewLog(log)}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Hapus">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteLog(log.id)}
                                                                color="error"
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                            labelRowsPerPage="Baris per halaman:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} dari ${count}`
                            }
                        />
                    </Card>

                    {/* Bulk Actions */}
                    <Box mt={3} display="flex" justifyContent="space-between">
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                startIcon={<Delete />}
                                onClick={() => {
                                    if (window.confirm('Hapus semua log?')) {
                                        // Implement bulk delete
                                    }
                                }}
                            >
                                Hapus Semua Log
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DateRange />}
                                onClick={() => {
                                    const cutoff = new Date();
                                    cutoff.setDate(cutoff.getDate() - 30);
                                    if (window.confirm(`Hapus log lama (sebelum ${cutoff.toLocaleDateString('id-ID')})?`)) {
                                        // Implement delete old logs
                                    }
                                }}
                            >
                                Hapus Log Lama
                            </Button>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={() => refetch()}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Container>

                {/* View Log Dialog */}
                <Dialog
                    open={viewDialogOpen}
                    onClose={() => setViewDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    {selectedLog && (
                        <>
                            <DialogTitle>
                                <Box display="flex" alignItems="center" gap={2}>
                                    {getLevelIcon(selectedLog.level)}
                                    <Typography variant="h6">
                                        Detail Log
                                    </Typography>
                                    <Chip
                                        label={selectedLog.level.toUpperCase()}
                                        color={getLevelColor(selectedLog.level) as any}
                                        size="small"
                                    />
                                </Box>
                            </DialogTitle>
                            <DialogContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            ID Log
                                        </Typography>
                                        <Typography variant="body1" fontFamily="monospace">
                                            {selectedLog.id}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Waktu
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedLog.timestamp)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Sumber
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedLog.source}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Pengguna
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedLog.userName || 'System'} ({selectedLog.userId || 'N/A'})
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Alamat IP
                                        </Typography>
                                        <Typography variant="body1" fontFamily="monospace">
                                            {selectedLog.ipAddress || 'N/A'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Pesan
                                        </Typography>
                                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 1 }}>
                                            <Typography variant="body1">
                                                {selectedLog.message}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    {selectedLog.details && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Detail Tambahan
                                            </Typography>
                                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 1 }}>
                                                <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                                    {JSON.stringify(selectedLog.details, null, 2)}
                                                </pre>
                                            </Paper>
                                        </Grid>
                                    )}
                                    {selectedLog.userAgent && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                User Agent
                                            </Typography>
                                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 1 }}>
                                                <Typography variant="caption" fontFamily="monospace">
                                                    {selectedLog.userAgent}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setViewDialogOpen(false)}>
                                    Tutup
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default LogsPage;
