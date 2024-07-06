import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Form, Input, Button, Checkbox, message} from 'antd';
import axios from '../api/axiosInstance';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        console.log('Login values:', values);
    
        const loginData = {
            username: values.username,
            password: values.password
        };
    
        console.log('Login data being sent:', loginData);
    
        try {
            const response = await axios.post('/auth/login', loginData);
            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }
    
            const token = response.data.token;
            console.log('Response data:', token);
    
            if (token) {
                localStorage.setItem('token', token);
                message.success('Login successful!');
                navigate('/dashboard');
            } else {
                message.error('Login failed. No token received.');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('Login failed. Please check your credentials.');
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
        </div>
    );
};

export default Login;