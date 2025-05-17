// import GoogleIcon from "@/icons/GoogleIcon";
import ContainerBox from "@/layouts/ContainerBox";
import GuestLayout from "@/layouts/GuestLayout";
import { router } from "@inertiajs/react";
import {
    Anchor,
    Button,
    Checkbox,
    // Divider,
    Progress,
    Group,
    PasswordInput,
    Text,
    TextInput,
    Title,
    // Removed: Center, Box (no longer needed for PasswordRequirement)
} from "@mantine/core";
// Removed: IconCheck, IconX (no longer needed for PasswordRequirement)
import { useForm } from "laravel-precognition-react-inertia";
import { useEffect, useRef, useState } from "react";
import LoginNotification from "./LoginNotification";
import classes from "./css/Login.module.css";

// Define requirements and getStrength function here if they are used elsewhere.
// For this request, they are removed from the render scope of Login.
const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}


const Login = ({ notify }) => {
    // const [socialLoginPending, setSocialLoginPending] = useState(false);
    const passwordRef = useRef(null);
    const [value, setValue] = useState(''); // State to track password input for strength meter
    const strength = getStrength(value);

    const form = useForm("post", route("auth.login.attempt"), {
        email: route().params?.email || "",
        password: "",
        remember: false,
    });

    useEffect(() => route().params?.email && passwordRef.current?.focus(), [route().params?.email]);

    const submit = (e) => {
        e.preventDefault();
        form.submit({ preserveScroll: true });
    };

    const bars = Array(4)
        .fill(0)
        .map((_, index) => (
            <Progress
                styles={{ section: { transitionDuration: '0ms' } }}
                value={
                    // Removed: value.length > 0 && index === 0 ? 100 :
                    strength >= ((index + 1) / 4) * 100 ? 100 : 0
                }
                color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
                key={index}
                size={4}
            />
        ));

    return (
        <>
            <Title ta="center" className={classes.title}>
                CV Ajat Konstruksi Majalengka
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                You may login to your account below
            </Text>

            <LoginNotification notify={notify} />

            <form onSubmit={submit}>
                <ContainerBox shadow="md" p={30} mt={30} radius="md">
                    {/* <Group grow mb="md" mt="md">
                        <Button
                            leftSection={<GoogleIcon />}
                            variant="default"
                            radius="xl"
                            component="a"
                            href={route("auth.login.social.google")}
                            loading={socialLoginPending}
                            onClick={() => setSocialLoginPending(true)}
                        >
                            Google
                        </Button>
                    </Group>

                    <Divider label="Or continue with email" labelPosition="center" my="lg" /> */}

                    <TextInput
                        label="Email"
                        placeholder="Your email"
                        required
                        value={form.data.email}
                        onChange={(e) => form.setData("email", e.target.value)}
                        onBlur={() => form.validate("email")}
                        error={form.errors.email}
                    />
                    <PasswordInput
                        ref={passwordRef}
                        label="Password"
                        placeholder="Your password"
                        required
                        mt="md"
                        value={form.data.password}
                        onChange={(e) => {
                            form.setData("password", e.target.value);
                            setValue(e.target.value); // Update local state for strength meter
                        }}
                    />
                    <Group gap={5} grow mt="xs" mb="md">
                        {bars}
                    </Group>

                    {/* Removed: PasswordRequirement and checks rendering */}
                    {/* <PasswordRequirement label="Has at least 6 characters" meets={form.data.password.length > 5} /> */}
                    {/* {checks} */}

                    <Group justify="space-between" mt="lg">
                        <Checkbox
                            label="Remember me"
                            checked={form.data.remember}
                            onChange={(event) => form.setData("remember", event.currentTarget.checked)}
                        />
                        <Anchor
                            type="button"
                            size="sm"
                            onClick={() => router.get(route("auth.forgotPassword.form"))}
                        >
                            Forgot password?
                        </Anchor>
                    </Group>
                    <Button type="submit" fullWidth mt="xl" disabled={form.processing}>
                        Sign in
                    </Button>
                </ContainerBox>
            </form>
        </>
    );
};

Login.layout = (page) => <GuestLayout title="Login">{page}</GuestLayout>;

export default Login;
