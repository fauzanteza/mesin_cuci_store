import React from 'react'
import { Box, Container, Typography, Paper, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import SEO from '../../components/SEO/SEO'

const TermsPage = () => {
    return (
        <Box>
            <SEO
                title="Terms of Service - Mesin Cuci Store"
                description="Read our Terms of Service to understand the rules and regulations for using Mesin Cuci Store's website and services."
            />

            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                            Terms of Service
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9 }}>
                            Please read these terms carefully before using our services.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                            Last Updated: January 20, 2026
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            {/* Content Section */}
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid', borderColor: 'divider' }}>
                    <Box component="section" mb={4}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            1. Introduction
                        </Typography>
                        <Typography paragraph>
                            Welcome to Mesin Cuci Store. By accessing or using our website, mobile application, and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all of these terms, do not use our services.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box component="section" mb={4}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            2. Use of Our Service
                        </Typography>
                        <Typography paragraph>
                            **Eligibility:** You must be at least 18 years old to use our services. By using our services, you represent and warrant that you meet this requirement.
                        </Typography>
                        <Typography paragraph>
                            **Account Security:** You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                        </Typography>
                        <Typography paragraph>
                            **Prohibited Activities:** You agree not to engage in any activity that interferes with or disrupts our services, or to use our services for any illegal or unauthorized purpose.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box component="section" mb={4}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            3. Products and Purchases
                        </Typography>
                        <Typography paragraph>
                            **Product Descriptions:** We strive to describe our products as accurately as possible. However, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or error-free.
                        </Typography>
                        <Typography paragraph>
                            **Pricing:** Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product or service at any time.
                        </Typography>
                        <Typography paragraph>
                            **Orders:** We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box component="section" mb={4}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            4. Intellectual Property
                        </Typography>
                        <Typography paragraph>
                            The service and its original content, features, and functionality are and will remain the exclusive property of Mesin Cuci Store and its licensors. The service is protected by copyright, trademark, and other laws of Indonesia and foreign countries.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box component="section" mb={4}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            5. Limitation of Liability
                        </Typography>
                        <Typography paragraph>
                            In no event shall Mesin Cuci Store, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box component="section" mb={4}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            6. Changes to Terms
                        </Typography>
                        <Typography paragraph>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </Typography>
                    </Box>

                    <Box component="section">
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            7. Contact Us
                        </Typography>
                        <Typography paragraph>
                            If you have any questions about these Terms, please contact us at: <br />
                            Email: legal@mesincucistore.com <br />
                            Phone: +62 21 1234 5678
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default TermsPage
