import React, { useState, useEffect} from "react";
import { Layout, Menu, Table, Button, Modal, Form, Input, message, Popconfirm, Select } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const { Header, Content } = Layout;
const { Option } = Select;

const SensorManagement = () => {
    const [loading, setLoading] = useState(true);
    const [sensors, setSensors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSensor, setEditingSensor] = useState(null);
    const [nextUID, setNextUID] = useState(null); 
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSensors();
    }, []);

    const fetchSensors = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/sensors');
            setSensors(response.data);
        } catch (error) {
            console.error('Failed to fetch sensors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNextUID = async () => {
        try {
            const response = await axiosInstance.get('/sensors/current-uid');
            setNextUID(response.data + 1);
        } catch (error) {
            console.error('Failed to fetch current UID:', error);
        }
    }

    const showModal = async () => {
        fetchNextUID();
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingSensor(null);
        form.resetFields();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            if (values.type === 'temperature') {
                values.value = parseFloat(values.value).toFixed(1);
            } else if (values.type === 'luminosity') {
                values.value = parseInt(values.value, 10);
            }

            if (editingSensor) {
                await axiosInstance.put(`/sensors/${values.type}/${editingSensor.id}`, { ...values, timestamp: editingSensor.timestamp });
                message.success('Sensor updated successfully');
            } else {
                await axiosInstance.post(`/sensors/${values.type}`, { ...values, uid: nextUID });
                message.success('Sensor added successfully');
            }
            fetchSensors();
            handleCancel();
        } catch (error) {
            console.error('Failed to save sensor:', error);
            message.error('Failed to save sensor');
        }
    };

    const handleEdit = (sensor) => {
        setEditingSensor(sensor);
        form.setFieldsValue({
            ...sensor,
            timestamp: sensor.timestamp ? new Date(sensor.timestamp).toISOString().slice(0, 16) : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id, type) => {
        try {
            await axiosInstance.delete(`/sensors/${type}/${id}`);
            message.success('Sensor deleted successfully');
            fetchSensors();
        } catch (error) {
            console.error('Failed to delete sensor:', error);
            message.error('Failed to delete sensor');
        }
    };

    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text) => {
                return text.charAt(0).toUpperCase() + text.slice(1);
            },
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (value, record) => {
                return record.type === 'temperature' ? `${parseFloat(value).toFixed(1)} ºC` : `${value} lx`;
            },
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: 'UID',
            dataIndex: 'uid',
            key: 'uid',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '5px' }}>
                    <Button 
                        onClick={() => handleEdit(record)} 
                        type="primary" 
                        style={{ backgroundColor: 'orange', color: 'white', borderColor: 'orange' }}
                    >
                        Edit
                    </Button>
                    <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id, record.type)}>
                        <Button type="primary" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        message.success('Logged out successfully');
    };

    const menuItems = [
        {
            label: 'Dashboard',
            key: '1',
            onClick: () => navigate('/dashboard'),
        },
        {
            label: 'Manage Sensors',
            key: '2',
            onClick: () => navigate('/manage-sensors'),
        },
        {
            label: "Logout",
            key: "3",
            onClick: handleLogout,
            style: { marginLeft: 'auto' }
        }
    ];

    return (
        <Layout>
            <Header>
                <Menu theme="dark" mode="horizontal" items={menuItems} />
            </Header>
            <Content style={{ padding: '50px' }}>
                <Button type="primary" onClick={showModal}>
                    Add Sensor
                </Button>
                <br></br>
                <br></br>
                <Table dataSource={sensors} columns={columns} loading={loading} rowKey="id" />
                <Modal
                    title={editingSensor ? 'Edit Sensor' : 'Add Sensor'}
                    open={isModalOpen}
                    onCancel={handleCancel}
                    onOk={handleSave}
                >
                    <Form form= {form} layout="vertical">
                        
                        <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select the Type!' }]}>
                            <Select disabled={!!editingSensor}>
                                <Option value="temperature">Temperature</Option>
                                <Option value="luminosity">Luminosity</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="value" label="Value" rules={[{ required: true, message: 'Please input the Value!' }]}>
                            <Input type="number" step="0.1" />
                        </Form.Item>
                        <Form.Item label="UID">
                            {editingSensor ? editingSensor.uid : nextUID}
                        </Form.Item>
                        <Form.Item name="uid" hidden>
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>    
            </Content>
        </Layout>
    );
};

export default SensorManagement;