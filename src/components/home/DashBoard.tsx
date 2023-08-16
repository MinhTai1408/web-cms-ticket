/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { Area } from "@ant-design/plots";
import { db } from "../../firebase/Firebase";
import { collection, getDocs } from "firebase/firestore";
import { Ticket } from "../../redux/interface/dataTicket";
import { Avatar, Col, DatePicker, Input, Layout, Row } from "antd";
import Sider from "antd/es/layout/Sider";
import MenuApp from "../../pages/menu/Menu";
import { Content, Header } from "antd/es/layout/layout";

import {
  CalendarOutlined,
  MailOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";

import PieMembership from "./PieMembership";
import PieFamily from "./PieFamily";
import Button from "antd/lib/button";

interface DataItem {
  ngayApDung: string;
  giaComBo: number;
}
const getDayOfWeek = (dateString: string): string => {
  const weekdays = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  const date = new Date(dateString);
  let dayOfWeek = date.getDay();
  // Adjust for the Vietnamese starting day of the week (Monday)
  dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return weekdays[dayOfWeek];
};

const DashBoard = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [totalGiaComBo, setTotalGiaComBo] = useState<number>(0);

  useEffect(() => {
    fetchFirestoreData();
  }, []);

  const fetchFirestoreData = async () => {
    const ticketCollectionRef = collection(db, "Ticket");
    const querySnapshot = await getDocs(ticketCollectionRef);

    const ticketData: DataItem[] = [];
    querySnapshot.forEach((doc) => {
      const ticket = doc.data() as Ticket;
      ticketData.push({
        ngayApDung: ticket.ngayApDung,
        giaComBo: ticket.giaComBo,
      });
    });

    const groupedData: { [key: string]: DataItem[] } = {};

    ticketData.forEach((item) => {
      if (!groupedData[item.ngayApDung]) {
        groupedData[item.ngayApDung] = [];
      }
      groupedData[item.ngayApDung].push(item);
    });

    const aggregatedData: DataItem[] = [];
    for (const ngayApDung in groupedData) {
      const giaComBoTotal = groupedData[ngayApDung].reduce(
        (sum, item) => sum + item.giaComBo,
        0
      );
      aggregatedData.push({
        ngayApDung: ngayApDung,
        giaComBo: giaComBoTotal,
      });
    }

    setData(aggregatedData);

    const totalGiaComBoInLastWeek = aggregatedData.reduce(
      (total, item) => total + item.giaComBo,
      0
    );

    setTotalGiaComBo(totalGiaComBoInLastWeek);
  };

  const dataTable: DataItem[] = data.map((item) => ({
    ngayApDung: item.ngayApDung.substring(8),
    giaComBo: item.giaComBo,
  }));

  dataTable.sort(
    (a, b) =>
      new Date(a.ngayApDung).getTime() - new Date(b.ngayApDung).getTime()
  );

  const config = {
    data: dataTable,
    xField: "ngayApDung",
    yField: "giaComBo",
    xAxis: {
      tickCount: 7, // Show tick labels for each day of the week
      tickFormatter: (value: string) => getDayOfWeek(value), // Format tick labels using getDayOfWeek function
    },
    smooth: true,
    areaStyle: {
      fill: "rgba(250, 160, 95, 0.26)",
    },
    color: "#FAA05F",
    line: {
      style: {
        lineWidth: 2,
      },
    },
  };

  return (
    <div>
      <Layout>
        <Sider style={{ height: 700 }}>
          <MenuApp />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, backgroundColor: "#f5f5f5" }}>
            <Row>
              <Col span={16}>
                <Input
                  placeholder="Nhập từ khóa"
                  style={{ width: 350, right: 200 }}
                  suffix={<SearchOutlined style={{ color: "black" }} />}
                />
              </Col>
              <Col span={8}>
                <Row style={{ backgroundColor: "#f5f5f5" }}>
                  <Col span={16}>
                    <Row>
                      <Col span={3} style={{ left: 270, paddingTop: 5 }}>
                        <MailOutlined />
                      </Col>
                      <Col span={3} style={{ left: 275, paddingTop: 5 }}>
                        <FontAwesomeIcon icon={faBell} />
                      </Col>
                      <Col span={2}>
                        <Avatar
                          size={30}
                          icon={<UserOutlined />}
                          style={{
                            borderRadius: "80%",
                            backgroundColor: "orange",
                            left: 280,
                          }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Header>
          <Content style={{ margin: "0 16px" }}>
            <Content style={{ backgroundColor: "white" }}>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "black",
                  textAlign: "start",
                  marginLeft: 15,
                }}
              >
                Thống kê
              </p>
              <Row style={{ marginLeft: 15, marginRight: 15 }}>
                <Col span={8} style={{ textAlign: "start" }}>
                  <p>Doanh thu</p>
                </Col>
                <Col span={16} style={{ textAlign: "end" }}>
                  <DatePicker
                    style={{ margin: "10px 0" }}
                    placeholder="Chọn ngày sử dụng"
                    suffixIcon={
                      <CalendarOutlined style={{ color: "orange" }} />
                    }
                  />
                </Col>
                <Col span={24} style={{ paddingTop: 20 }}>
                  <Area {...config} />
                  <Col span={24} style={{ textAlign: "start", paddingTop: 20 }}>
                    <a style={{ color: "black" }}>Tổng doanh thu theo tuần: </a>
                    <br />
                    <a
                      style={{ fontSize: 20, fontWeight: 500, color: "black" }}
                    >
                      {totalGiaComBo.toLocaleString("VI-VN")}
                    </a>{" "}
                    đồng
                  </Col>
                </Col>
                <Col span={24}>
                  <Row style={{ paddingTop: 15 }}>
                    <Col span={4}>
                      <DatePicker
                        style={{ margin: "10px 0" }}
                        placeholder="Chọn ngày sử dụng"
                        suffixIcon={
                          <CalendarOutlined style={{ color: "orange" }} />
                        }
                      />
                    </Col>
                    <Col span={7}>
                      <Row>
                        <Col span={24} style={{ paddingTop: 15 }}>
                          <a style={{ marginRight: 100, color: "black" }}>
                            Gói thành viên
                          </a>
                        </Col>
                        <Col span={24} style={{ top: -80 }}>
                          <PieMembership />
                        </Col>
                      </Row>
                    </Col>
                    <Col span={7}>
                      <Row>
                        <Col span={24} style={{ paddingTop: 15 }}>
                          <a style={{ marginRight: 100, color: "black" }}>
                            Gói gia đình
                          </a>
                        </Col>
                        <Col span={24} style={{ top: -80 }}>
                          <PieFamily />
                        </Col>
                      </Row>
                    </Col>
                    <Col span={5} style={{ paddingTop: 60 }}>
                      <div>
                        <Button
                          style={{
                            width: 60,
                            height: 25,
                            background: "#4F75FF",
                            right: 8,
                          }}
                        ></Button>
                        &nbsp;Vé đã sử dụng
                      </div>
                      <div style={{ paddingTop: 15 }}>
                        <Button
                          style={{
                            width: 60,
                            height: 25,
                            background: "#FF8A48",
                          }}
                        ></Button>
                        &nbsp;Vé chưa sử dụng
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Content>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default DashBoard;
