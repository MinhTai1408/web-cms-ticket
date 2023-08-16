import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Tag,
  TimePicker,
  message,
} from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useEffect, useState } from "react";

import { Content, Header } from "antd/es/layout/layout";
import {
  CalendarOutlined,
  DownOutlined,
  FieldTimeOutlined,
  FormOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../../redux/hook/Hook";
import {
  TicketWithId,
  fetchTicket,
  updateTicket,
} from "../../redux/features/ticketSlice";
import { RootState } from "../../redux/store/rootStore";
import Table, { ColumnsType } from "antd/es/table";
import { utils, write } from "xlsx";
import { saveAs } from "file-saver";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/Firebase";
import dayjs from "dayjs";
import MenuApp from "../../pages/menu/Menu";

const PAGE_SIZE = 4;

const TicketPackage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [size] = useState(12);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [stt, setStt] = useState(1);

  //thêm gói vé
  const [tenGoi, setTenGoi] = useState("");
  const [ngayApDung, setNgayApDung] = useState<dayjs.Dayjs | null>(null);
  const [ngayHetHan, setNgayHetHan] = useState<dayjs.Dayjs | null>(null);
  const [isVeLe, setIsVeLe] = useState(false);
  const [veLeData, setVeLeData] = useState({ quantity: 0, price: "" });
  const [isComboVe, setIsComboVe] = useState(false);
  const [comboVeData, setComboVeData] = useState({ quantity: 0, price: "" });
  const [tinhTrang, setTinhTrang] = useState("");

  //edit gói vé
  const [editTicketData, setEditTicketData] = useState<TicketWithId | null>(
    null
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNgayApDung, setEditNgayApDung] = useState<dayjs.Dayjs | null>(
    null
  );
  const [editNgayHetHan, setEditNgayHetHan] = useState<dayjs.Dayjs | null>(
    null
  );
  const [editIsVeLe, setEditIsVeLe] = useState(true);
  const [editVeLeData, setEditVeLeData] = useState({ quantity: 0, price: "" });
  const [editIsComboVe, setEditIsComboVe] = useState(true);
  const [editComboVeData, setEditComboVeData] = useState({
    quantity: 0,
    price: "",
  });

  const dispatch = useAppDispatch();
  const ticketArray: TicketWithId[] = useAppSelector(
    (state: RootState) => state.tickets.ticketArray
  );

  const showModal = () => {
    setOpen(true);
  };

  const handleEditClick = (ticket: TicketWithId) => {
    setEditTicketData(ticket);
    setEditModalVisible(true);
    form.setFieldsValue(ticket.ticket);

    // Set the values for editNgayApDung and editNgayHetHan
    setEditNgayApDung(
      ticket.ticket.ngayApDung
        ? dayjs(ticket.ticket.ngayApDung, "HH:mm - DD/MM/YYYY")
        : null
    );
    setEditNgayHetHan(
      ticket.ticket.ngayHetHan
        ? dayjs(ticket.ticket.ngayHetHan, "HH:mm - DD/MM/YYYY")
        : null
    );
    setEditIsVeLe(!!ticket.ticket.giaVe); // Set isVeLe based on giaVe existence
    setEditVeLeData({
      quantity: 0, // Assuming a default value for quantity
      price: `${ticket.ticket.giaVe}` || "",
      // Set price based on giaVe
    });

    setEditIsComboVe(!!!ticket.ticket.giaComBo); // Set isComboVe based on giaComBo existence
    setEditComboVeData({
      quantity: ticket.ticket.soLuongVe, // Assuming a default value for quantity
      price: `${ticket.ticket.giaVeCombo}` || "",
      // Set price based on giaComBo
    });
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    dispatch(fetchTicket());
  }, [dispatch]);

  //nút tìm kiếm
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredData = ticketArray?.filter((ticket) =>
    ticket.ticket?.tenGoi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentData = filteredData?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPageCount = Math.ceil((filteredData?.length ?? 0) / PAGE_SIZE);

  const columns: ColumnsType<TicketWithId> = [
    {
      title: "Stt", // Add a new column for serial number
      dataIndex: "stt",
      key: "stt",
      render: (_, record, index) => (currentPage - 1) * PAGE_SIZE + index + 1,
    },
    {
      title: "Mã gói",
      dataIndex: ["ticket", "maGoi"],
      key: "maGoi",
    },
    {
      title: "Tên gói",
      dataIndex: ["ticket", "tenGoi"],
      key: "tenGoi",
    },
    {
      title: "Ngày áp dụng",
      dataIndex: ["ticket", "ngayApDung"],
      key: "ngayApDung",
    },
    {
      title: "Ngày hết hạn",
      dataIndex: ["ticket", "ngayHetHan"],
      key: "ngayHetHan",
    },
    {
      title: "Gía vé",
      dataIndex: ["ticket", "giaVe"],
      key: "giaVe",
      render: (text: number) => `${text.toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Gía Combo",
      dataIndex: ["ticket", "giaComBo"],
      key: "giaComBo",
      render: (text: number, record: any) => (
        <span>
          {text.toLocaleString("vi-VN")} VND / {record.ticket.soLuongVe} vé
        </span>
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: ["ticket", "tinhTrang"],
      key: "tinhTrang",
      render: (tinhTrang: string) => {
        if (tinhTrang === "Tắt") {
          return (
            <Tag color="red" key={tinhTrang}>
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
              {tinhTrang}
            </Tag>
          );
        } else {
          return (
            <Tag color="green" key={tinhTrang}>
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
              {tinhTrang}
            </Tag>
          );
        }
      },
    },
    {
      render: (ticket: TicketWithId) => (
        <p
          style={{ color: "orange", fontSize: 15 }}
          key={ticket.id}
          onClick={() => handleEditClick(ticket)}
        >
          <FormOutlined /> Edit
        </p>
      ),
    },
  ];

  const exportToExcel = () => {
    const exportData = filteredData.map((item) => ({
      "Mã gói": item.ticket?.maGoi,
      "Tên Gói": item.ticket?.tenGoi,
      "Ngày áp dụng": item.ticket?.ngayApDung,
      "Ngày hết hạn": item.ticket?.ngayHetHan,
      "Gía vé": item.ticket?.giaVe,
      "Gía Combo": item.ticket?.giaComBo,
      "Tình trạng": item.ticket?.tinhTrang,
    }));

    const worksheet = utils.json_to_sheet(exportData);

    const workbook = {
      Sheets: { "Danh sách gói vé": worksheet },
      SheetNames: ["Danh sách gói vé"],
    };

    const excelFile = write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelFile], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "danh_sách_gói_vé.xlsx");
  };

  const generateRandomString = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 10;
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  };

  const generateRandomNumber = () => {
    const number = "0123456789";
    const length = 12;
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * number.length);
      result += number.charAt(randomIndex);
    }

    return result;
  };

  const handleSaveTicket = async () => {
    setStt((prevStt) => prevStt + 1);
    if (!tenGoi) {
      message.error("Hãy nhập tên gói.");
      return;
    }
    if (!ngayApDung) {
      message.error("Hãy chọn ngày áp dụng.");
      return;
    }
    if (!ngayHetHan) {
      message.error("Hãy chọn ngày hết hạn.");
      return;
    }
    if (!isVeLe && !veLeData.price) {
      message.error("Hãy chọn và nhập giá vé lẻ.");
      return;
    }
    if (!tinhTrang) {
      message.error("Hãy chọn tình trạng.");
      return;
    }
    const randomState = () => {
      const randomValue = Math.random();
      if (randomValue < 1 / 2) {
        return "Đã đối soát";
      } else {
        return "Chưa đối soát";
      }
    };

    const randomHd = () => {
      const randomValues = Math.random();
      if (randomValues < 1 / 3) {
        return "Đã sử dụng";
      } else if (randomValues < 2 / 3) {
        return "Chưa sử dụng";
      } else {
        return "Hết hạn";
      }
    };

    const randomCong = () => {
      const randomValue = Math.random();
      if (randomValue < 1 / 5) {
        return "Cổng 1";
      } else if (randomValue < 2 / 5) {
        return "Cổng 2";
      } else if (randomValue < 3 / 5) {
        return "Cổng 3";
      } else if (randomValue < 4 / 5) {
        return "Cổng 4";
      } else {
        return "Cổng 5";
      }
    };

    try {
      const values = await form.validateFields();
      setLoading(true);
      const formattedNgayApDung = ngayApDung
        ? dayjs(ngayApDung).locale("vi").format("HH:mm - DD/MM/YYYY")
        : "";
      const formattedNgayHetHan = ngayHetHan
        ? dayjs(ngayHetHan).locale("vi").format("HH:mm - DD/MM/YYYY")
        : "";
      let formattedGiaVe = "";
      let formattedGiaComBo = "";

      if (isVeLe && veLeData.price) {
        const priceValueVe = parseFloat(veLeData.price);
        if (priceValueVe >= 100) {
          formattedGiaVe = priceValueVe * 1000 + `VND`;
        } else if (priceValueVe >= 10) {
          formattedGiaVe = priceValueVe * 100 + `VND`;
        } else {
          formattedGiaVe = priceValueVe + `VND`;
        }
      }

      if (isComboVe && comboVeData.price) {
        const priceValue = parseFloat(comboVeData.price) * comboVeData.quantity;
        if (priceValue >= 1000) {
          formattedGiaComBo =
            priceValue * 1000 + ` VND / ${!!!comboVeData.quantity} vé`;
        } else if (priceValue >= 100) {
          formattedGiaComBo =
            priceValue * 1000 + ` VND / ${!!!comboVeData.quantity} vé`;
        } else {
          formattedGiaComBo =
            priceValue + ` VND / ${!!!comboVeData.quantity} vé`;
        }
      }

      const formattedGiaVeComboValue = parseFloat(
        comboVeData.price.replace(/[^\d.-]/g, "")
      );
      const formattedMaGoi = generateRandomString();
      const formattedMaSk = generateRandomString();
      const formaatedSoVe = generateRandomNumber();
      let ticket = {
        maSk: formattedMaSk,
        maGoi: formattedMaGoi,
        tenGoi: values.tenGoi,
        ngayApDung: formattedNgayApDung, // Format date
        ngayHetHan: formattedNgayHetHan, // Format date
        giaVe: parseFloat(formattedGiaVe),
        giaComBo: parseFloat(formattedGiaComBo),

        tinhTrang: values.tinhTrang,
        soVe: formaatedSoVe,
        loaiVe: "Vé cổng",
        checkIn: randomCong(),
        tenSk: "Hội chợ triển lãm người tiêu dùng 2021",
        doiSoat: randomState(),
        trangThai: randomHd(),
        soLuongVe: comboVeData.quantity,
        giaVeCombo: parseFloat(
          formattedGiaVeComboValue
            .toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })
            .replace(/[^\d.-]/g, "")
        ),
      };

      await addDoc(collection(db, "Ticket"), ticket);

      setTenGoi("");
      setNgayApDung(null);
      setNgayHetHan(null);
      setIsVeLe(false);
      setVeLeData({ quantity: 0, price: "" });
      setIsComboVe(false);
      setComboVeData({ quantity: 0, price: "" });
      setTinhTrang("");
      setLoading(false);
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleEditSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);

    if (editTicketData) {
      const formattedNgayApDung = editNgayApDung
        ? editNgayApDung.locale("vi").format("HH:mm - DD/MM/YYYY")
        : "";
      const formattedNgayHetHan = editNgayHetHan
        ? editNgayHetHan.locale("vi").format("HH:mm - DD/MM/YYYY")
        : "";

      let formattedEditGiaVe = "";
      let formattedEditGiaComBo = "";

      if (editIsVeLe && editVeLeData.price) {
        const priceValue = parseFloat(editVeLeData.price);
        formattedEditGiaVe =
          priceValue >= 1000
            ? `${(priceValue / 1000).toFixed(3)}.000 VND`
            : `${priceValue.toFixed(3)} VND`;
      }

      if (editIsComboVe && editComboVeData.price) {
        const priceValue =
          parseFloat(editComboVeData.price) * editComboVeData.quantity;
        if (priceValue >= 1000) {
          formattedEditGiaComBo =
            priceValue * 1000 + ` VND / ${!!!editComboVeData.quantity} vé`;
        } else if (priceValue >= 100) {
          formattedEditGiaComBo =
            priceValue * 1000 + ` VND / ${!!!editComboVeData.quantity} vé`;
        } else {
          formattedEditGiaComBo =
            priceValue + ` VND / ${!!!editComboVeData.quantity} vé`;
        }
      }
      const formattedEditGiaVeValue = parseFloat(
        formattedEditGiaVe.replace(/[^\d.-]/g, "")
      );

      const formattedEditGiaVeComboValue = parseFloat(
        editComboVeData.price.replace(/[^\d.-]/g, "")
      );
      const update: TicketWithId = {
        id: editTicketData.id,
        ticket: {
          ...editTicketData.ticket,
          maSk: values.maSk,
          tenSk: values.tenSk,
          giaVe: parseFloat(
            formattedEditGiaVeValue
              .toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })
              .replace(/[^\d.-]/g, "")
          ),
          giaComBo: parseFloat(formattedEditGiaComBo),
          ngayApDung: formattedNgayApDung, // Format date
          ngayHetHan: formattedNgayHetHan, // Format date
          tinhTrang: values.tinhTrang,

          soLuongVe: editComboVeData.quantity,
          giaVeCombo: parseFloat(
            formattedEditGiaVeComboValue
              .toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })
              .replace(/[^\d.-]/g, "")
          ),
        },
      };
      dispatch(updateTicket(update)).then(() => {
        setLoading(false);
        message.success("Update sussces");
        setOpen(false);
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
          <Header style={{ padding: 0, backgroundColor: "#f5f5f5" }} />
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
                Danh sách gói vé
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
                      onClick={exportToExcel}
                      style={{ background: " #FFF2E7", color: "#FF9138" }}
                    >
                      Xuất file
                    </Button>
                    <Button
                      style={{ background: "#FF9138", color: "white" }}
                      onClick={showModal}
                    >
                      Thêm gói vé
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
        open={open}
        onOk={handleSaveTicket}
        onCancel={handleCancel}
        width={730}
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
                onClick={handleCancel}
                style={{ backgroundColor: " #FFF2E7", color: "#FF9138" }}
              >
                Hủy
              </Button>
              <Button
                key="submit"
                loading={loading}
                onClick={handleSaveTicket}
                style={{ background: "#FF9138", color: "white" }}
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
          Thêm gói vé
        </p>
        <Form layout="vertical" form={form} onFinish={handleSaveTicket}>
          <Row>
            <Col span={24}>
              <Form.Item label="Tên gói" name="tenGoi">
                <Input
                  style={{ width: 400 }}
                  onChange={(e) => setTenGoi(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày áp dụng" name="ngayApDung">
                <Space>
                  <DatePicker
                    placeholder="Ngày áp dụng"
                    suffixIcon={
                      <CalendarOutlined style={{ color: "orange" }} />
                    }
                    value={ngayApDung}
                    onChange={(date, dateString) => setNgayApDung(date)}
                  />
                  <TimePicker
                    placeholder="Giờ áp dụng"
                    value={ngayApDung}
                    suffixIcon={
                      <FieldTimeOutlined style={{ color: "orange" }} />
                    }
                    onChange={(time, timeString) => {
                      setNgayApDung((prev) =>
                        prev
                          ? prev
                              .hour(time?.hour() ?? 0)
                              .minute(time?.minute() ?? 0)
                          : time
                      );
                    }}
                  />
                </Space>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày hết hạn" name="ngayHetHan">
                <Space>
                  <DatePicker
                    placeholder="Ngày hết hạn"
                    value={ngayHetHan}
                    onChange={(date, dateString) => setNgayHetHan(date)}
                    suffixIcon={
                      <CalendarOutlined style={{ color: "orange" }} />
                    }
                  />
                  <TimePicker
                    placeholder="Giờ hết hạn"
                    value={ngayHetHan}
                    suffixIcon={
                      <FieldTimeOutlined style={{ color: "orange" }} />
                    }
                    onChange={(time, timeString) => {
                      setNgayHetHan((prev) =>
                        prev
                          ? prev
                              .hour(time?.hour() ?? 0)
                              .minute(time?.minute() ?? 0)
                          : time
                      );
                    }}
                  />
                </Space>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <p>Gía vé áp dụng</p>
            <Col span={24}>
              <Row>
                <Col span={6}>
                  <Checkbox onChange={(e) => setIsVeLe(e.target.checked)}>
                    Vé lẻ (vnđ/vé) với giá
                  </Checkbox>
                </Col>
                <Col span={18}>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item name="giaVe">
                        <Input
                          placeholder="Giá vé lẻ"
                          style={{ width: 100 }}
                          disabled={!isVeLe}
                          value={veLeData.price}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (
                              !isNaN(newValue) &&
                              newValue >= 0 &&
                              newValue <= 99999
                            ) {
                              setVeLeData((prev) => ({
                                ...prev,
                                price: newValue.toString(),
                              }));
                            } else {
                              setVeLeData((prev) => ({
                                ...prev,
                                price: "",
                              }));
                            }
                          }}
                        />
                        &ensp;vé
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            <Col span={24} style={{ paddingTop: 20 }}>
              <Row>
                <Col span={6}>
                  <Checkbox onChange={(e) => setIsComboVe(e.target.checked)}>
                    Combo vé với giá
                  </Checkbox>
                </Col>
                <Col span={18}>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item name="giaComBo">
                        <Input
                          placeholder="giá vé"
                          value={comboVeData.price}
                          style={{ width: 100 }}
                          disabled={!isComboVe}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (
                              !isNaN(newValue) &&
                              newValue >= 0 &&
                              newValue <= 99999
                            ) {
                              setComboVeData((prev) => ({
                                ...prev,
                                price: newValue.toString(),
                              }));
                            } else {
                              setComboVeData((prev) => ({
                                ...prev,
                                price: "",
                              }));
                            }
                          }}
                        />
                        &ensp;/&ensp;
                        <Input
                          type="number"
                          placeholder="số lượng vé"
                          style={{ width: 100 }}
                          disabled={!isComboVe}
                          value={comboVeData.quantity}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            if (
                              !isNaN(newValue) &&
                              newValue >= 0 &&
                              newValue <= 100
                            ) {
                              setComboVeData((prev) => ({
                                ...prev,
                                quantity: newValue,
                              }));
                            } else {
                              setComboVeData((prev) => ({
                                ...prev,
                                quantity: 0,
                              }));
                            }
                          }}
                        />
                        &ensp;vé
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ paddingTop: 15 }}>
            <Col span={24}>
              <Form.Item label="Tình trạng" name="tinhTrang">
                <Select
                  placeholder="Tình trạng"
                  onChange={(value) => setTinhTrang(value)}
                  suffixIcon={<DownOutlined style={{ color: "orange" }} />}
                  style={{ width: 150 }}
                >
                  <Select.Option value="Đang áp dụng">
                    Đang áp dụng
                  </Select.Option>
                  <Select.Option value="Tắt">Tắt</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        open={editModalVisible}
        onOk={handleEditSubmit}
        width={730}
        onCancel={() => setEditModalVisible(false)}
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
                style={{ backgroundColor: " #FFF2E7", color: "#FF9138" }}
              >
                Hủy
              </Button>
              <Button
                key="submit"
                loading={loading}
                onClick={handleEditSubmit}
                style={{ background: "#FF9138", color: "white" }}
              >
                Cập nhật
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
          Cập nhật thông tin gói vé
        </p>

        {editTicketData && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
            initialValues={{
              maSk: editTicketData.ticket.maSk,
              tenSk: editTicketData.ticket.tenSk,
              ngayApDung: editNgayApDung,
              ngayHetHan: editNgayHetHan,
              giaVe: editIsVeLe,
              giaComBo: editIsComboVe,
              tinhTrang: editTicketData.ticket.tinhTrang,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mã sự kiện" name="maSk">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tên sự kiện" name="tenSk">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ngày áp dụng" name="ngayApDung">
                  <Space>
                    <DatePicker
                      placeholder="Ngày áp dụng"
                      suffixIcon={
                        <CalendarOutlined style={{ color: "orange" }} />
                      }
                      value={editNgayApDung}
                      onChange={(date, dateString) => setEditNgayApDung(date)}
                    />
                    <TimePicker
                      placeholder="Giờ áp dụng"
                      value={editNgayApDung}
                      suffixIcon={
                        <FieldTimeOutlined style={{ color: "orange" }} />
                      }
                      onChange={(time, timeString) => setEditNgayApDung(time)}
                    />
                  </Space>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày hết hạn" name="ngayHetHan">
                  <Space>
                    <DatePicker
                      placeholder="Ngày hết hạn"
                      value={editNgayHetHan}
                      onChange={(date, dateString) => setEditNgayHetHan(date)}
                      suffixIcon={
                        <CalendarOutlined style={{ color: "orange" }} />
                      }
                    />
                    <TimePicker
                      placeholder="Giờ hết hạn"
                      value={editNgayHetHan}
                      suffixIcon={
                        <FieldTimeOutlined style={{ color: "orange" }} />
                      }
                      onChange={(time, timeString) => setEditNgayHetHan(time)}
                    />
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <p>Gía vé áp dụng</p>
              <Col span={24}>
                <Row>
                  <Col span={6}>
                    <Checkbox onChange={(e) => setEditIsVeLe(e.target.checked)}>
                      Vé lẻ (vnđ/vé) với giá
                    </Checkbox>
                  </Col>
                  <Col span={18}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="giaVe">
                          <Input
                            placeholder="Giá vé lẻ"
                            style={{ width: 100 }}
                            disabled={!editIsVeLe}
                            value={editVeLeData.price}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value);
                              if (
                                !isNaN(newValue) &&
                                newValue >= 0 &&
                                newValue <= 99999
                              ) {
                                setEditVeLeData((prev) => ({
                                  ...prev,
                                  price: newValue.toString(),
                                }));
                              } else {
                                setEditVeLeData((prev) => ({
                                  ...prev,
                                  price: "",
                                }));
                              }
                            }}
                          />
                          &ensp;vé
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>

              <Col span={24} style={{ paddingTop: 20 }}>
                <Row>
                  <Col span={6}>
                    <Checkbox
                      onChange={(e) => setEditIsComboVe(e.target.checked)}
                    >
                      Combo vé với giá
                    </Checkbox>
                  </Col>
                  <Col span={18}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="giaComBo">
                          <Input
                            placeholder="giá vé"
                            value={editComboVeData.price}
                            style={{ width: 100 }}
                            disabled={!editIsComboVe}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value);
                              if (
                                !isNaN(newValue) &&
                                newValue >= 0 &&
                                newValue <= 99999
                              ) {
                                setEditComboVeData((prev) => ({
                                  ...prev,
                                  price: newValue.toString(),
                                }));
                              } else {
                                setEditComboVeData((prev) => ({
                                  ...prev,
                                  price: "",
                                }));
                              }
                            }}
                          />
                          &ensp;/&ensp;
                          <Input
                            type="number"
                            placeholder="số lượng vé"
                            style={{ width: 100 }}
                            disabled={!editIsComboVe}
                            value={editComboVeData.quantity}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value);
                              if (
                                !isNaN(newValue) &&
                                newValue >= 0 &&
                                newValue <= 100
                              ) {
                                setEditComboVeData((prev) => ({
                                  ...prev,
                                  quantity: newValue,
                                }));
                              } else {
                                setEditComboVeData((prev) => ({
                                  ...prev,
                                  quantity: 0,
                                }));
                              }
                            }}
                          />
                          &ensp;vé
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Tình trạng" name="tinhTrang">
                  <Select
                    style={{ width: 150 }}
                    suffixIcon={<DownOutlined style={{ color: "orange" }} />}
                  >
                    <Select.Option value="Đang áp dụng">
                      Đang áp dụng
                    </Select.Option>
                    <Select.Option value="Tắt">Tắt</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </div>
  );
};
export default TicketPackage;
