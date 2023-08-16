import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook/Hook";
import { RootState } from "../../redux/store/rootStore";
import {
  TicketWithId,
  fetchTicket,
  updateTicket,
} from "../../redux/features/ticketSlice";
import {
  Avatar,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  Pagination,
  Radio,
  Row,
  Space,
  Tag,
  message,
} from "antd";
import Sider from "antd/es/layout/Sider";
import MenuApp from "../../pages/menu/Menu";
import { Content, Header } from "antd/es/layout/layout";
import {
  CalendarOutlined,
  MailOutlined,
  MoreOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import Table, { ColumnsType } from "antd/es/table";
import { utils, write } from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const PAGE_SIZE = 4;
const TicketList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [size] = useState(12);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterTrangThai, setFilterTrangThai] = useState<string | null>(null);
  const [filterNgayApDung, setFilterNgayApDung] = useState<dayjs.Dayjs | null>(
    null
  );
  const [openEdit, setOpenEdit] = useState(false);

  const [filterCheckIn, setFilterCheckIn] = useState<string[]>([]);
  const [selectAllCheckIn, setSelectAllCheckIn] = useState(false);

  const dispatch = useAppDispatch();
  const ticketArray: TicketWithId[] = useAppSelector(
    (state: RootState) => state.tickets.ticketArray
  );
  const [filteredData, setFilteredData] = useState(ticketArray);

  const [editTicketData, setEditTicketData] = useState<TicketWithId | null>(
    null
  );
  const [editNgayHetHan, setEditNgayHetHan] = useState<dayjs.Dayjs | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchTicket());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(ticketArray);
  }, [ticketArray]);

  const handleCancelEdit = () => {
    setOpenEdit(false);
  };

  const handleEditClick = (ticket: TicketWithId) => {
    setEditTicketData(ticket);
    setOpenEdit(true);
    form.setFieldsValue(ticket.ticket);

    setEditNgayHetHan(
      ticket.ticket.ngayHetHan
        ? dayjs(ticket.ticket.ngayHetHan, "HH:mm - DD/MM/YYYY")
        : null
    );
  };

  const applyFilters = () => {
    let filteredData = ticketArray;

    if (filterTrangThai) {
      filteredData = filteredData.filter(
        (ticket) => ticket.ticket?.trangThai === filterTrangThai
      );
    }

    if (filterNgayApDung) {
      const formattedDate = filterNgayApDung.format("DD/MM/YYYY");
      filteredData = filteredData.filter((ticket) =>
        ticket.ticket.ngayApDung.includes(formattedDate)
      );
    }

    if (filterCheckIn.length > 0 && !filterCheckIn.includes("Tất cả")) {
      filteredData = filteredData.filter((ticket) => {
        const checkIn = ticket.ticket?.checkIn;
        return checkIn && filterCheckIn.includes(checkIn);
      });
    }

    setFilteredData(filteredData);
  };

  const currentData = filteredData?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const columns: ColumnsType<TicketWithId> = [
    {
      title: "Stt", // Add a new column for serial number
      dataIndex: "stt",
      key: "stt",
      render: (_, record, index) => (currentPage - 1) * PAGE_SIZE + index + 1,
    },
    {
      title: "Booking Code",
      dataIndex: ["ticket", "maGoi"],
      key: "maGoi",
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
      title: "Tình trạng sử dụng",
      dataIndex: ["ticket", "trangThai"],
      key: "trangThai",
      render: (trangThai: string) => {
        if (trangThai === "Hết hạn") {
          return (
            <Tag color="red" key={trangThai}>
              <span
                style={{
                  backgroundColor: "red",
                  borderRadius: "50%",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  marginRight: "4px",
                }}
              ></span>
              {trangThai}
            </Tag>
          );
        } else if (trangThai === "Chưa sử dụng") {
          return (
            <Tag color="green" key={trangThai}>
              <span
                style={{
                  backgroundColor: "green",
                  borderRadius: "50%",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  marginRight: "4px",
                }}
              ></span>
              {trangThai}
            </Tag>
          );
        } else {
          return (
            <Tag color="#bfbfbf" key={trangThai}>
              <span
                style={{
                  backgroundColor: "grey",
                  borderRadius: "50%",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  marginRight: "4px",
                }}
              ></span>
              {trangThai}
            </Tag>
          );
        }
      },
    },
    {
      title: "Ngày sử dụng",
      dataIndex: ["ticket", "ngayApDung"],
      key: "ngayApDung",
    },
    {
      title: "Ngày xuất vé ",
      dataIndex: ["ticket", "ngayApDung"],
      key: "ngayApDung",
    },
    {
      title: "Cổng check in",
      dataIndex: ["ticket", "checkIn"],
      key: "checkIn",
    },
    {
      render: (ticket: TicketWithId) => (
        <p
          style={{ fontSize: 17 }}
          key={ticket.id}
          onClick={() => handleEditClick(ticket)}
        >
          <MoreOutlined />
        </p>
      ),
    },
  ];

  const exportToExcel = () => {
    const exportData = filteredData.map((item) => ({
      "Booking code": item.ticket?.maSk,
      "Số vé": item.ticket?.soVe,
      "Tên Gói": item.ticket?.tenGoi,
      "Tên sự kiện": item.ticket?.tenSk,
      "Tình trạng sử dụng": item.ticket?.trangThai,
      "Ngày sử dụng": item.ticket?.ngayApDung,
      "Ngày xuất vé ": item.ticket?.ngayApDung,
      "Cổng check in": item.ticket?.checkIn,
    }));

    const worksheet = utils.json_to_sheet(exportData);

    const workbook = {
      Sheets: { "Danh sách vé": worksheet },
      SheetNames: ["Danh sách vé"],
    };

    const excelFile = write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelFile], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "danh_sách_vé.xlsx");
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);

    const filteredData = ticketArray.filter((ticket) =>
      ticket.ticket?.soVe?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filteredData);
  };

  const handleEditSubmit = async () => {
    setLoading(true);

    if (editTicketData) {
      const formattedNgayHetHan = editNgayHetHan
        ? editNgayHetHan.locale("vi").format("HH:mm - DD/MM/YYYY")
        : "";

      const update: TicketWithId = {
        id: editTicketData.id,
        ticket: {
          ...editTicketData.ticket,
          ngayHetHan: formattedNgayHetHan, // Format date
        },
      };
      dispatch(updateTicket(update)).then(() => {
        setLoading(false);
        message.success("Update success");
        setOpenEdit(false);
        window.location.reload();
      });
    }
  };

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
                Danh sách vé
              </p>
              <Row style={{ marginLeft: 15, marginRight: 15 }}>
                <Col span={8}>
                  <Input
                    placeholder="Nhập từ khóa"
                    onChange={(e) => handleSearch(e.target.value)}
                    suffix={<SearchOutlined style={{ color: "black" }} />}
                  />
                </Col>
                <Col span={16} style={{ textAlign: "end" }}>
                  <Space size={size}>
                    <Button
                      style={{ borderColor: "#ffa940", color: "#FF9138" }}
                      onClick={() => setFilterVisible(true)}
                    >
                      <FontAwesomeIcon icon={faFilter} /> Lọc vé
                    </Button>
                    <Button
                      style={{ borderColor: "#ffa940", color: "#FF9138" }}
                      onClick={exportToExcel}
                    >
                      Xuất file (.csv)
                    </Button>
                  </Space>
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
          </Content>
        </Layout>
      </Layout>
      <Modal
        open={filterVisible}
        onCancel={() => setFilterVisible(false)}
        width={470}
        onOk={applyFilters}
        footer={[
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 20,
            }}
          >
            <Button
              key="submit"
              onClick={applyFilters}
              size="large"
              style={{ borderColor: " #fa8c16", color: "orange", width: 150 }}
            >
              Lọc
            </Button>
          </div>,
        ]}
      >
        <p
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "black",
            textAlign: "center",
          }}
        >
          Lọc vé
        </p>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Từ ngày">
                <DatePicker
                  style={{ margin: "10px 0" }}
                  placeholder="Chọn ngày sử dụng"
                  suffixIcon={<CalendarOutlined style={{ color: "orange" }} />}
                  onChange={(date) => setFilterNgayApDung(date)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đến ngày">
                <DatePicker
                  style={{ margin: "10px 0" }}
                  placeholder="Chọn ngày sử dụng"
                  suffixIcon={<CalendarOutlined style={{ color: "orange" }} />}
                  onChange={(date) => setFilterNgayApDung(date)}
                />
              </Form.Item>
            </Col>
          </Row>
          <p>Tình trạng sử dụng</p>
          <Row>
            <Col>
              <Radio.Group
                onChange={(e) => setFilterTrangThai(e.target.value)}
                value={filterTrangThai}
              >
                <Radio value={null}>Tất cả</Radio>{" "}
                <Radio value="Đã sử dụng">Đã sử dụng</Radio>
                <Radio value="Chưa sử dụng">Chưa sử dụng</Radio>
                <Radio value="Hết hạn">Hết hạn</Radio>
              </Radio.Group>
            </Col>
          </Row>
          <p>Cổng check-in</p>
          <Row>
            <Col span={24}>
              <Checkbox.Group
                value={filterCheckIn}
                onChange={(values) => {
                  setFilterCheckIn(values.map(String));
                  setSelectAllCheckIn(values.includes("Tất cả"));
                }}
              >
                <Row>
                  <Col span={8}>
                    <Checkbox value="Tất cả">Tất cả</Checkbox>
                    <br />
                    <Checkbox value="Cổng 3" disabled={selectAllCheckIn}>
                      Cổng 3
                    </Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="Cổng 1" disabled={selectAllCheckIn}>
                      Cổng 1
                    </Checkbox>
                    <Checkbox value="Cổng 4" disabled={selectAllCheckIn}>
                      Cổng 4
                    </Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="Cổng 2" disabled={selectAllCheckIn}>
                      Cổng 2
                    </Checkbox>
                    <Checkbox value="Cổng 5" disabled={selectAllCheckIn}>
                      Cổng 5
                    </Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        open={openEdit}
        onCancel={() => setOpenEdit(false)}
        onOk={handleEditSubmit}
        footer={[
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 20,
            }}
          >
            <Space size={size}>
              <Button
                key="back"
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: " #FFF2E7",
                  color: "#FF9138",
                  width: 100,
                }}
              >
                Hủy
              </Button>
              <Button
                key="submit"
                loading={loading}
                onClick={handleEditSubmit}
                style={{ background: "#FF9138", color: "white", width: 100 }}
              >
                Lưu
              </Button>
            </Space>
          </div>,
        ]}
      >
        <p
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "black",
            textAlign: "center",
          }}
        >
          Đổi ngày sử dụng vé
        </p>
        {editTicketData && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
            initialValues={{
              ngayHetHan: editNgayHetHan,
            }}
          >
            <Row gutter={16}>
              <Col span={6}>Số vé:</Col>
              <Col span={18}>{editTicketData.ticket.maSk}</Col>
            </Row>
            <Row gutter={16} style={{ paddingTop: 20 }}>
              <Col span={6}>Số vé:</Col>
              <Col span={18}>
                {editTicketData.ticket.loaiVe} - {editTicketData.ticket.tenGoi}
              </Col>
            </Row>
            <Row gutter={16} style={{ paddingTop: 20 }}>
              <Col span={6}>Tên sự kiện:</Col>
              <Col span={18}>{editTicketData.ticket.tenSk}</Col>
            </Row>
            <Row gutter={16} style={{ paddingTop: 20 }}>
              <Col span={6}>Hạn sử dụng: </Col>
              <Col span={18}>
                <Form.Item name="ngayHetHan">
                  <Space>
                    <DatePicker
                      placeholder="Ngày hết hạn"
                      value={editNgayHetHan}
                      onChange={(date, dateString) => setEditNgayHetHan(date)}
                      suffixIcon={
                        <CalendarOutlined style={{ color: "orange" }} />
                      }
                    />
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default TicketList;
