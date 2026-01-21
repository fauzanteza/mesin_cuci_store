import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Button,
    Card,
    Grid,
    TextField,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Alert,
    CircularProgress,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import { brandService, Brand } from '../../services/brandService';
import { uploadService } from '../../services/uploadService';
import DataTable from '../../components/Admin/DataTable';
import AlertSnackbar from '../../components/UI/Alert';

const BrandsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        country: 'Indonesia',
        foundedYear: new Date().getFullYear()
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info'
    });

    // Fetch brands
    const { data: brands, isLoading, error } = useQuery({
        queryKey: ['brands'],
        queryFn: brandService.getAllBrands
    });

    // Create brand mutation
    const createMutation = useMutation({
        mutationFn: (data: FormData) => brandService.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setSnackbar({
                open: true,
                message: 'Brand berhasil ditambahkan',
                severity: 'success'
            });
            handleCloseDialog();
        },
        onError: (error: any) => {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Gagal menambahkan brand',
                severity: 'error'
            });
        }
    });

    // Update brand mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
            brandService.updateBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setSnackbar({
                open: true,
                message: 'Brand berhasil diperbarui',
                severity: 'success'
            });
            handleCloseDialog();
        },
        onError: (error: any) => {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Gagal memperbarui brand',
                severity: 'error'
            });
        }
    });

    // Delete brand mutation
    const deleteMutation = useMutation({
        mutationFn: brandService.deleteBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setSnackbar({
                open: true,
                message: 'Brand berhasil dihapus',
                severity: 'success'
            });
        },
        onError: (error: any) => {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Gagal menghapus brand',
                severity: 'error'
            });
        }
    });

    // Toggle brand status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            brandService.toggleBrandStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setSnackbar({
                open: true,
                message: 'Status brand berhasil diubah',
                severity: 'success'
            });
        }
    });

    const handleOpenDialog = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                description: brand.description || '',
                website: brand.website || '',
                country: brand.country || 'Indonesia',
                foundedYear: brand.foundedYear || new Date().getFullYear()
            });
            setLogoPreview(brand.logo || '');
        } else {
            setEditingBrand(null);
            setFormData({
                name: '',
                description: '',
                website: '',
                country: 'Indonesia',
                foundedYear: new Date().getFullYear()
            });
            setLogoPreview('');
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingBrand(null);
        setFormData({
            name: '',
            description: '',
            website: '',
            country: 'Indonesia',
            foundedYear: new Date().getFullYear()
        });
        setLogoFile(null);
        setLogoPreview('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('website', formData.website);
        formDataToSend.append('country', formData.country);
        formDataToSend.append('foundedYear', formData.foundedYear.toString());

        if (logoFile) {
            formDataToSend.append('logo', logoFile);
        }

        if (editingBrand) {
            updateMutation.mutate({ id: editingBrand.id, data: formDataToSend });
        } else {
            createMutation.mutate(formDataToSend);
        }
    };

    const handleDeleteBrand = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus brand ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleToggleStatus = (id: string, isActive: boolean) => {
        toggleStatusMutation.mutate({ id, isActive: !isActive });
    };

    const columns = [
        {
            field: 'logo',
            headerName: 'Logo',
            width: 80,
            renderCell: (params: any) => (
                <Avatar
                    src={params.value}
                    alt={params.row.name}
                    sx={{ width: 50, height: 50 }}
                >
                    {params.row.name.charAt(0)}
                </Avatar>
            )
        },
        {
            field: 'name',
            headerName: 'Nama Brand',
            width: 200
        },
        {
            field: 'productCount',
            headerName: 'Produk',
            width: 100,
            type: 'number'
        },
        {
            field: 'country',
            headerName: 'Negara',
            width: 120
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 120,
            renderCell: (params: any) => (
                <Chip
                    label={params.value ? 'Aktif' : 'Nonaktif'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                    onClick={() => handleToggleStatus(params.row.id, params.value)}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Aksi',
            width: 150,
            renderCell: (params: any) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(params.row)}
                        color="primary"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDeleteBrand(params.row.id)}
                        color="error"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                Gagal memuat data brands: {(error as Error).message}
            </Alert>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Manajemen Brand
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Tambah Brand
                </Button>
            </Box>

            <Card>
                <DataTable
                    rows={brands || []}
                    columns={columns}
                    loading={isLoading}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                />
            </Card>

            {/* Add/Edit Brand Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingBrand ? 'Edit Brand' : 'Tambah Brand Baru'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                    <Avatar
                                        src={logoPreview}
                                        sx={{ width: 100, height: 100, mb: 2 }}
                                    >
                                        {formData.name.charAt(0)}
                                    </Avatar>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<UploadIcon />}
                                    >
                                        Upload Logo
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nama Brand"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Deskripsi"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    type="url"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Negara"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Tahun Berdiri"
                                    name="foundedYear"
                                    value={formData.foundedYear}
                                    onChange={handleInputChange}
                                    type="number"
                                    inputProps={{ min: 1900, max: new Date().getFullYear() }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Batal</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? (
                                <CircularProgress size={24} />
                            ) : editingBrand ? (
                                'Simpan Perubahan'
                            ) : (
                                'Tambah Brand'
                            )}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Snackbar for notifications */}
            <AlertSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            />
        </Box>
    );
};

export default BrandsPage;
