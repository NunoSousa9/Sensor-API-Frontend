import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, message, Modal } from 'antd';
import axios from '../api/axiosInstance';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            message.warning('You are already logged in. If you wish to leave, please log out.');
            navigate('/dashboard');
        }
    }, [navigate]);
    
    const onFinish = async (values) => {
        setLoading(true);
        console.log('Login data being sent:', values);

        try {
            const response = await axios.post('/auth/login', {
                username: values.username,
                password: values.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response);

            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                message.success('Login successful!');
                navigate('/dashboard');
            } else {
                message.error('Login failed. Please check your credentials.');
            }
        } catch (error) {
            message.error('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const onFinishRegister = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('/auth/register', {
                username: values.username,
                password: values.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                message.success('Registration successful! You can now log in.');
                setIsRegisterModalOpen(false);
            } else {
                message.error('Registration failed.');
            }
        } catch (error) {
            message.error('Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    

    return (
        <div style={{ maxWidth: 300, margin: '0 auto', padding: '50px' }}>
            <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                        Log in
                    </Button>
                </Form.Item> 
            </Form>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button type="link" onClick={() => setIsRegisterModalOpen(true)}>
                    New user? Register here
                </Button>
            </div>
            <Modal
                title="Register"
                open={isRegisterModalOpen}
                onCancel={() => setIsRegisterModalOpen(false)}
                footer={null}
            >
                <Form name="register" initialValues={{ remember: true }} onFinish={onFinishRegister}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Login;
