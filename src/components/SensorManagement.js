import React, { useState, useEffect} from "react";
import { Layout, Menu, Table, Button, Modal, Form, Input, message, Popconfirm, Select } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const { Header, Content } = Layout;
const { Option } = Select;

const SensorManagement = () => {
    const [loading, setLoading] = useState(true);
    const [sensors, setSensors] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSensor, setEditingSensor] = useState(null);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSensors();
    }, []);

    const fetchSensors = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            const response = await axiosInstance.get('/sensors', config);
            console.log('Fetched sensors:', response.data);
            setSensors(response.data);
        } catch (error) {
            console.error('Failed to fetch sensors:', error);
        } finally {
            setLoading(false);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingSensor(null);
        form.resetFields();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log('Form values:', values);

            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}`}
            };
            
            if (editingSensor) {
                if (values.type === "temperature") {
                    const response = await axiosInstance.put(`/sensors/temperature/${editingSensor.id}`, values, config);
                    console.log('Update response:', response.data);
                } else {
                    const response = await axiosInstance.put(`/sensors/luminosity/${editingSensor.id}`, values, config);
                    console.log('Update response:', response.data);
                }
                message.success('Sensor uptated successfully');
            } else {
                if (values.type === "temperature") {
                    const response = await axiosInstance.post('/sensors/temperature', values, config);
                    console.log('Add response:', response.data); 
                } else {
                    const response = await axiosInstance.post('/sensors/luminosity', values, config);
                    console.log('Add response:', response.data);
                }
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
        form.setFieldValue(sensor);
        showModal();
    };

    const handleDelete = async (id, type) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (type === "temperature") {
                await axiosInstance.delete(`/sensors/temperature/${id}`, config);
            } else {
                await axiosInstance.delete(`/sensors/luminosity/${id}`, config);
            }
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
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'value',
        },
        {
            title: 'UID',
            dataIndex: 'uid',
            key: 'uid',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                <>
                    <Button onClick={() => handleEdit(record)} type="link">
                        Edit
                    </Button>
                    <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </>
            },
        },
    ];

    return (
        <Layout>
            <Header>
                <Menu theme="dark" mode="horizontal">
                    <Menu.Item key="1" onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
                    <Menu.Item key="2" onClick={() => navigate('/manage-sensors')}>Manage Sensors</Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '50px' }}>
                <Button type="primary" onClick={showModal}>
                    Add Sensor
                </Button>
                <Table dataSource={sensors} columns={columns} loading={loading} rowKey="id" />
                <Modal
                    title={editingSensor ? 'Edit Sensor' : 'Add Sensor'}
                    visible={isModalVisible}
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
                            <Input type="number"/>
                        </Form.Item>
                        <Form.Item name="timestamp" label="Timestamp" rules={[{ required: true, message: 'Please input the Timestamp!' }]}>
                            <Input type="datetime-local" />
                        </Form.Item>
                        <Form.Item name="uid" label="UID" rules={[{ required: true, message: 'Please input the UID!' }]}>
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>    
            </Content>
        </Layout>
    );
};

export default SensorManagement;