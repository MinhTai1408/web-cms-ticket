import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  Pagination,
  Radio,
  Row,
  Select,
} from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useEffect, useState } from "react";
import MenuApp from "../../pages/menu/Menu";
import { Content, Header } from "antd/es/layout/layout";
import { MailOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { TicketWithId, fetchTicket } from "../../redux/features/ticketSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook/Hook";
import { RootState } from "../../redux/store/rootStore";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
const PAGE_SIZE = 4;
const TicketExchange: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [size] = useState(12);
  const [stt, setStt] = useState(1);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const [isSettled, setIsSettled] = useState(false);
  const [filter, setFilter] = useState("Tất cả");
  const dispatch = useAppDispatch();

  const ticketArray: TicketWithId[] = useAppSelector(
    (state: RootState) => state.tickets.ticketArray
  );
  const [filteredData, setFilteredData] = useState(ticketArray);

  useEffect(() => {
    dispatch(fetchTicket());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(ticketArray);
  }, [ticketArray]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);

    const filteredData = ticketArray.filter((ticket) =>
      ticket.ticket?.soVe?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filteredData);
  };

  const currentData = filteredData?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFilter = () => {
    let filteredData = [...ticketArray];
    if (filter === "Đã đối soát" || filter === "Chưa đối soát") {
      filteredData = filteredData.filter(
        (ticket) => ticket.ticket.doiSoat === filter
      );
    }

    if (selectedDate) {
      const formattedDate = selectedDate.format("DD/MM/YYYY");
      filteredData = filteredData.filter((ticket) =>
        ticket.ticket.ngayApDung.includes(formattedDate)
      );
    }

    setFilteredData(filteredData);
    setCurrentPage(1);
    const hasSettled = filteredData.some(
      (ticket) => ticket.ticket.doiSoat === "Chưa đối soát"
    );
    setIsSettled(!hasSettled);
  };

  const handleExportExcel = () => {
    const filteredSettledData = ticketArray.filter(
      (ticket) => ticket.ticket.doiSoat === "Đã đối soát"
    );
    if (filteredSettledData.length === 0) {
      return;
    }
    const exportData = filteredSettledData.map((item) => ({
      "Số vé": item.ticket?.soVe,
      "Tên sự kiện": item.ticket?.tenSk,
      "Ngày sử dụng": item.ticket?.ngayApDung,
      "Loại vé": item.ticket?.loaiVe,
      "Cổng check in": item.ticket?.checkIn,
      "": item.ticket?.doiSoat,
    }));

    const worksheet = utils.json_to_sheet(exportData);

    const workbook = {
      Sheets: { "Đối soát vé": worksheet },
      SheetNames: ["Đối soát vé"],
    };

    const excelFile = write(workbook, { bookType: "xlsx", type: "array" });

    const excelBlob = new Blob([excelFile], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the Blob as a file
    saveAs(excelBlob, "đối_soát_vé.xlsx");
  };

  const columns: ColumnsType<TicketWithId> = [
    {
      title: "Stt", // Add a new column for serial number
      dataIndex: "stt",
      key: "stt",
      render: (_, record, index) => (currentPage - 1) * PAGE_SIZE + index + 1,
    },
    {
      title: "Số vé",
      dataIndex: ["ticket", "soVe"],
      key: "soVe",
    },
    {
      title: "Tên Sự kiện",
      dataIndex: ["ticket", "tenSk"],
      key: "tenSk",
    },
    {
      title: "Ngày sử dụng",
      dataIndex: ["ticket", "ngayApDung"],
      key: "ngayApDung",
    },

    {
      title: "Loại vé",
      dataIndex: ["ticket", "loaiVe"],
      key: "loaiVe",
    },
    {
      title: "Cổng check in",
      dataIndex: ["ticket", "checkIn"],
      key: "checkIn",
    },
    {
      dataIndex: ["ticket", "doiSoat"],
      key: "doiSoat",
      render: (doiSoat: string) => (
        <span style={{ color: doiSoat === "Đã đối soát" ? "red" : "grey" }}>
          {doiSoat}
        </span>
      ),
    },
  ];
  return (
    <div>
      <Layout style={{ minHeight: 700 }}>
        <Sider>
          <MenuApp />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, backgroundColor: "#f5f5f5" }}>
            <Row>
              <Col span={16}>
                <Input
                  placeholder="Nhập từ khóa"
                  style={{ width: 350, right: 200 }}
                  onChange={(e) => handleSearch(e.target.value)}
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
            <Row>
              <Col span={18}>
                <Content style={{ backgroundColor: "white" }}>
                  <p
                    style={{
                      fontSize: 25,
                      fontWeight: 500,
                      color: "black",
                      textAlign: "start",
                      marginLeft: 15,
                    }}
                  >
                    Đối soát vé
                  </p>
                  <Row style={{ marginLeft: 15, marginRight: 15 }}>
                    <Col span={8}>
                      <Input
                        placeholder="Tìm bằng số vé"
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </Col>
                    <Col span={16} style={{ textAlign: "end" }}>
                      {isSettled ? (
                        <Button
                          style={{
                            backgroundColor: " #FFF2E7",
                            color: "#FF9138",
                          }}
                          onClick={handleExportExcel}
                        >
                          Xuất file (.csv)
                        </Button>
                      ) : (
                        <Button
                          style={{ background: "#FF9138", color: "white" }}
                        >
                          Chốt đối soát
                        </Button>
                      )}
                    </Col>
                    <Col span={24} style={{ paddingTop: 20 }}>
                      <Table
                        dataSource={currentData}
                        columns={columns}
                        pagination={false}
                        rowKey="key"
                      />
                      <Pagination
                        style={{ marginTop: 16, textAlign: "center" }}
                        current={currentPage}
                        total={(filteredData?.length ?? 0) || 0}
                        pageSize={PAGE_SIZE}
                        onChange={(page) => setCurrentPage(page)}
                      />
                    </Col>
                  </Row>
                </Content>
              </Col>
              <Col span={6} style={{ paddingTop: 5, left: 5 }}>
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
                    Lọc vé
                  </p>
                  <Form>
                    <Row style={{ marginLeft: 15, marginRight: 15 }}>
                      <Col span={24}>
                        <Form.Item>
                          <Select>
                            <option value="Hội chợ triển lãm người tiêu dùng 2021">
                              Hội chợ triển lãm người tiêu dùng 2021
                            </option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row style={{ marginLeft: 15 }}>
                      <Col span={24}>
                        <Row>
                          <Col span={12}>
                            <a style={{ textAlign: "start", color: "black" }}>
                              Tình trạng đối soát:
                            </a>
                          </Col>
                          <Col span={12}>
                            <Radio.Group
                              onChange={(e) => setFilter(e.target.value)}
                              value={filter}
                            >
                              <Radio value="Tất cả" style={{ right: 30 }}>
                                Tất cả
                              </Radio>
                              <Radio value="Đã đối soát" style={{ right: 13 }}>
                                Đã đối soát
                              </Radio>
                              <Radio value="Chưa đối soát" style={{ right: 5 }}>
                                Chưa đối soát
                              </Radio>
                            </Radio.Group>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row style={{ marginLeft: 15, paddingTop: 20 }}>
                      <Col span={24}>
                        <Row>
                          <Col span={6}>
                            <a style={{ textAlign: "start", color: "black" }}>
                              Loại vé :
                            </a>
                          </Col>
                          <Col span={18}>
                            <a style={{ color: "black" }}>Vé cổng</a>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row style={{ marginLeft: 15, paddingTop: 20 }}>
                      <Col span={24}>
                        <Row>
                          <Col span={6}>
                            <a style={{ textAlign: "start", color: "black" }}>
                              Từ ngày :
                            </a>
                          </Col>
                          <Col span={18}>
                            <DatePicker
                              placeholder="Chọn ngày áp dụng"
                              style={{
                                width: 150,
                                marginLeft: 40,
                              }}
                              onChange={(date) => setSelectedDate(date)}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row style={{ marginLeft: 15, paddingTop: 20 }}>
                      <Col span={24}>
                        <Row>
                          <Col span={6}>
                            <a style={{ textAlign: "start", color: "black" }}>
                              Đến ngày :
                            </a>
                          </Col>
                          <Col span={18}>
                            <DatePicker
                              placeholder="Chọn ngày áp dụng"
                              style={{
                                width: 150,
                                marginLeft: 40,
                              }}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <div style={{ paddingTop: 20 }}>
                      <Button
                        style={{
                          borderColor: "#ffa940",
                          color: "#FF9138",
                          textAlign: "center",
                        }}
                        onClick={handleFilter}
                      >
                        Lọc
                      </Button>
                    </div>
                  </Form>
                </Content>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default TicketExchange;
