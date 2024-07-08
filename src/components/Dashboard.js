import React, { useState, useEffect } from "react";
import { Layout, Menu, Card, Row, Col, Statistic, Button, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Papa from "papaparse";

const { Header, Content } = Layout;
const { Option } = Select;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [temperatureSensors, setTemperatureSensors] = useState([]);
    const [luminositySensors, setLuminositySensors] = useState([]);
    const [temperatureStats, setTemperatureStats] = useState({ min: 0, max: 0, avg: 0, stdDev: 0 });
    const [luminosityStats, setLuminosityStats] = useState({ min: 0, max: 0, avg: 0, stdDev: 0 });
    const [exportType, setExportType] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tempResponse, lumResponse] = await Promise.all([
                axiosInstance.get('/sensors/temperature'),
                axiosInstance.get('/sensors/luminosity')
            ]);

            const tempSensors = Array.isArray(tempResponse.data) ? tempResponse.data : [];
            const lumSensors = Array.isArray(lumResponse.data) ? lumResponse.data : [];

            setTemperatureSensors(tempSensors);
            setLuminositySensors(lumSensors);

            if (tempSensors.length > 0) {
              const tempValues = tempSensors.map(sensor => sensor.value);
                setTemperatureStats({
                    min: Math.min(...tempSensors.map(sensor => sensor.value)),
                    max: Math.max(...tempSensors.map(sensor => sensor.value)),
                    avg: (tempSensors.reduce((sum, sensor) => sum + sensor.value, 0) / tempSensors.length).toFixed(2),
                    stdDev: calculateStandardDeviation(tempValues).toFixed(2)
                });
            }

            if (lumSensors.length > 0) {
              const lumValues = lumSensors.map(sensor => sensor.value);
                setLuminosityStats({
                    min: Math.min(...lumSensors.map(sensor => sensor.value)),
                    max: Math.max(...lumSensors.map(sensor => sensor.value)),
                    avg: (lumSensors.reduce((sum, sensor) => sum + sensor.value, 0) / lumSensors.length).toFixed(2),
                    stdDev: calculateStandardDeviation(lumValues).toFixed(2)
                });
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStandardDeviation = (values) => {
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
      const avgSquaredDiff = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;
      return Math.sqrt(avgSquaredDiff);
  };

  const exportData = (type) => {
    let dataToExport = [];

    if (type === "temperature") {
      dataToExport = temperatureSensors;
    } else if (type === "luminosity") {
      dataToExport = luminositySensors;
    } else {
      dataToExport = [...temperatureSensors, ...luminositySensors];
    }

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${type}_sensors_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`);
  }

    const menuItems = [
        {
            label: "Dashboard",
            key: "1",
            onClick: () => navigate("/dashboard"),
        },
        {
            label: "Manage Sensors",
            key: "2",
            onClick: () => navigate("/manage-sensors"),
        },
    ];

    return (
        <Layout>
            <Header>
                <Menu theme="dark" mode="horizontal" items={menuItems} />
            </Header>
            <Content style={{ padding: "50px" }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card loading={loading} title="Temperature Sensors">
                            <Statistic title="Count" value={temperatureSensors.length} />
                            <Statistic title="Average Value" value={`${temperatureStats.avg} ºC`} />
                            <Statistic title="Min Value" value={`${temperatureStats.min} ºC`} />
                            <Statistic title="Max Value" value={`${temperatureStats.max} ºC`} />
                            <Statistic title="Standard Deviation" value={`${temperatureStats.stdDev} ºC`} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card loading={loading} title="Luminosity Sensors">
                            <Statistic title="Count" value={luminositySensors.length} />
                            <Statistic title="Average Value" value={`${luminosityStats.avg} lx`} />
                            <Statistic title="Min Value" value={`${luminosityStats.min} lx`} />
                            <Statistic title="Max Value" value={`${luminosityStats.max} lx`} />
                            <Statistic title="Standard Deviation" value={`${luminosityStats.stdDev} lx`} />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                    <Col span={24}>
                        <Card title="Export Data">
                            <Select
                                defaultValue="all"
                                style={{ width: 200, marginRight: "20px" }}
                                onChange={value => setExportType(value)}
                            >
                                <Option value="all">All Sensors</Option>
                                <Option value="temperature">Temperature Sensors</Option>
                                <Option value="luminosity">Luminosity Sensors</Option>
                            </Select>
                            <Button type="primary" onClick={() => exportData(exportType)}>
                                Export to CSV
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Dashboard;

