import React, {useState, useEffect} from "react";
import { Layout, Menu, Card, Row, Col, Statistic } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const { Header, Content } = Layout;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [temperatureSensors, setTemperatureSensors] = useState ([]);
    const [luminositySensors, setLuminositySensors] = useState ([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const tempResponse = await axiosInstance.get('/sensors/temperature');
            const lumResponse = await axiosInstance.get('/sensors/luminosity');

            setTemperatureSensors(Array.isArray(tempResponse.data) ? tempResponse.data : []);
            setLuminositySensors(Array.isArray(lumResponse.data) ? lumResponse.data : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Header>
                <Menu theme="dark" mode="horizontal">
                <Menu.Item key="1" onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
                <Menu.Item key="2" onClick={() => navigate('/manage-sensors')}>Manage Sensors</Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '50px' }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card loading= {loading} title="Temperature Sensors">
                            <Statistic title="Count" value={temperatureSensors.length} />
                            <Statistic title="Average Value" value={temperatureSensors.length > 0 ? temperatureSensors.reduce((sum, sensor) => sum + sensor.value, 0) / temperatureSensors.length : 0} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card loading={loading} title="Luminosity Sensors">
                            <Statistic title="Count" value={luminositySensors.length} />
                            <Statistic title="Average Value" value={luminositySensors.length > 0 ? luminositySensors.reduce((sum, sensor) => sum + sensor.value, 0) / luminositySensors.length : 0} />
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Dashboard;