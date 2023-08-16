import React, { useEffect, useState } from "react";
import { Pie } from "@ant-design/plots";
import { db } from "../../firebase/Firebase";
import { collection, getDocs } from "firebase/firestore";

interface TicketData {
  giaComBo: number;
  trangThai: "Đã sử dụng" | "Chưa sử dụng";
  tenGoi: string;
}

const PieMembership = () => {
  const [usedData, setUsedData] = useState<number>(0); // Tổng dữ liệu cho trạng thái đã sử dụng
  const [unusedData, setUnusedData] = useState<number>(0); // Tổng dữ liệu cho trạng thái chưa sử dụng

  useEffect(() => {
    // Lấy dữ liệu từ Firestore
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Ticket"));

        let usedTotal: number = 0;
        let unusedTotal: number = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as TicketData;
          if (
            data.trangThai === "Đã sử dụng" &&
            data.tenGoi === "Gói thành viên"
          ) {
            usedTotal += data.giaComBo;
          } else if (
            data.trangThai === "Chưa sử dụng" &&
            data.tenGoi === "Gói thành viên"
          ) {
            unusedTotal += data.giaComBo;
          }
        });

        setUsedData(usedTotal);
        setUnusedData(unusedTotal);
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };

    fetchData();
  }, []);

  const data = [
    {
      type: "Đã Sử Dụng",
      value: usedData,
    },
    {
      type: "Chưa Sử Dụng",
      value: unusedData,
    },
  ];

  const config = {
    data,
    angleField: "value",
    colorField: "type",
    radius: 0.7,
    innerRadius: 0.5,
    label: {
      type: "inner",
      offset: "-50%",

      style: {
        textAlign: "center",
        fontSize: 10,
      },
    },
    color: ["#4F75FF", "#FF8A48"],
    legend: {
      visible: false,
    },
    statistic: {
      title: undefined,
      content: undefined,
    },
  };

  return <Pie {...config} />;
};

export default PieMembership;
