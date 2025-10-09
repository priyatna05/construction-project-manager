import { Head, useForm } from '@inertiajs/react';
import { Button, TextInput, Container, Title, Text } from '@mantine/core';

export default function VerifyOtp() {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('otp.verify.post'));
    };

    return (
        <Container size="sm" py="xl">
            <Head title="Verifikasi OTP" />

            <Title order={2} ta="center" mb="md">
                Verifikasi Akun Anda
            </Title>

            <Text ta="center" mb="lg">
                Masukkan kode OTP yang telah dikirim ke email Anda untuk mengaktifkan akun.
            </Text>

            <form onSubmit={submit}>
                <TextInput
                    label="Kode OTP"
                    placeholder="Masukkan 6 digit kode OTP"
                    value={data.otp}
                    onChange={(e) => setData('otp', e.target.value)}
                    error={errors.otp}
                    maxLength={6}
                    required
                    mb="md"
                />

                <Button type="submit" fullWidth loading={processing}>
                    Verifikasi
                </Button>
            </form>

            <Text ta="center" mt="md" size="sm" c="dimmed">
                Kode OTP berlaku selama 24 jam.
            </Text>
        </Container>
    );
}
