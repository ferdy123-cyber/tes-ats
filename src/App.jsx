import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  AutoComplete,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import axios from "axios";

function App() {
  const baseUrl = "https://202.157.176.100:3000";
  const [form] = Form.useForm();
  const [negara, setnegara] = useState([]);
  const [loadingNegara, setLoadingNegara] = useState(false);
  const [pelabuhan, setpelabuhan] = useState([]);
  const [loadingPelabuhan, setLoadingPelabuhan] = useState(false);
  const [barang, setbarang] = useState([]);
  const [loadingBarang, setLoadingBarang] = useState(false);
  const [version, setVersion] = useState(null);
  const updateVersion = () => {
    // ini berfungsi agar value form di antd berubah, karna get fields value di form antd berubah saat ada props yang berubah juga
    setVersion(String(Date.now()));
  };
  // untuk menghandle error binding
  const handleError = (err) => {
    console.log(err);
    message.error("service error");
  };
  const getNegara = async () => {
    try {
      setLoadingNegara(true);
      const resp = await axios.get(baseUrl + `/negaras`);
      setnegara(resp.data);
      setLoadingNegara(false);
    } catch (err) {
      setLoadingNegara(false);
      handleError(err);
    }
  };
  const getPelabuhan = async (negaraId) => {
    try {
      setLoadingPelabuhan(true);
      const resp = await axios.get(baseUrl + `/pelabuhans`, {
        params: {
          filter: {
            where: {
              id_negara: negaraId,
            },
          },
        },
      });
      setpelabuhan(resp.data);
      setLoadingPelabuhan(false);
    } catch (err) {
      setLoadingPelabuhan(false);
      handleError(err);
    }
  };
  const getBarang = async (pelabuhanId) => {
    try {
      setLoadingBarang(true);
      const resp = await axios.get(baseUrl + `/barangs`, {
        params: {
          filter: {
            where: {
              id_pelabuhan: pelabuhanId,
            },
          },
        },
      });
      setbarang(resp.data);
      setLoadingBarang(false);
    } catch (err) {
      setLoadingBarang(false);
      handleError(err);
    }
  };
  // fungsi yang di panggil saat halaman di render
  useEffect(() => {
    getNegara();
  }, []);
  const formValue = form.getFieldsValue();
  console.log(formValue);
  useEffect(() => {
    // menjumlahkan diskon dengan harga
    form.setFieldsValue({
      total: separatorRibuan(
        formValue.price - (formValue.price * formValue.discount) / 100,
        "Rp "
      ),
    });
  }, [formValue]);
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        name="basic"
        style={{ width: 400 }}
        autoComplete="off"
      >
        <Form.Item label="Negara :" name="negara">
          <Select
            onSelect={(e) => {
              // untuk mengosongkan form pelabuhan, description, dan barang saat value di ganti
              form.setFieldsValue({
                pelabuhan: null,
                description: null,
                barang: null,
                discount: null,
                price: null,
              });
              // memanggil api get pelabuhan saat value di ganti
              getPelabuhan(e);
              // mengosongkan data barang
              setbarang([]);
            }}
            loading={loadingNegara}
            showSearch
            optionFilterProp="label"
            options={
              // destruktur array sesuai dengan bentuk component select di antd
              negara.map((e) => ({
                value: e.id_negara,
                label: `${e.kode_negara} - ${e.nama_negara.toUpperCase()}`,
              }))
            }
          />
        </Form.Item>
        <Form.Item label="Pelabuhan :" name="pelabuhan">
          <Select
            onSelect={(e) => {
              // untuk mengosongkan form barang dan description saat value di ganti
              form.setFieldsValue({
                barang: null,
                description: null,
                discount: null,
                price: null,
              });
              // memanggil api get barang saat value di ganti
              getBarang(e);
            }}
            disabled={pelabuhan.length == 0}
            loading={loadingPelabuhan}
            showSearch
            optionFilterProp="label"
            options={
              // destruktur array sesuai dengan bentuk component select di antd
              pelabuhan.map((e) => ({
                value: e.id_pelabuhan,
                label: e.nama_pelabuhan.toUpperCase(),
              }))
            }
          />
        </Form.Item>
        <Form.Item label="Barang :" name="barang">
          <Select
            onSelect={(e) => {
              // untuk mem parse object string, kedalam bentuk object, dengan ini bisa mendapatkan semua data key object
              const parse = JSON.parse(e);
              // untuk mengisi deskripsi dan diskon barang
              form.setFieldsValue({
                description: parse.description,
                discount: parse.diskon,
                price: parse.harga,
              });
              updateVersion();
            }}
            disabled={barang.length == 0}
            loading={loadingBarang}
            showSearch
            optionFilterProp="label"
            options={
              // destruktur array sesuai dengan bentuk component select di antd
              barang.map((e) => ({
                // karna untuk value membutuhkan semua key, maka value di jadikan object string
                value: JSON.stringify(e),
                label: `${e.id_barang} - ${e.nama_barang.toUpperCase()}`,
              }))
            }
          />
        </Form.Item>
        <Form.Item label="Deskripsi Barang :" name="description">
          <Input.TextArea
            style={
              !formValue.barang
                ? {}
                : { backgroundColor: "white", color: "rgba(0, 0, 0, 0.88)" }
            }
            disabled
          />
        </Form.Item>
        <Row gutter={[10, 0]}>
          <Col span={12}>
            <Form.Item label="Diskon (%) :" name="discount">
              <InputNumber
                style={
                  !formValue.barang
                    ? { width: "100%" }
                    : {
                        backgroundColor: "white",
                        color: "rgba(0, 0, 0, 0.88)",
                        width: "100%",
                      }
                }
                disabled
                onChange={() => {
                  updateVersion();
                }}
                max={100}
                controls={false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Harga Barang :" name="price">
              <InputNumber
                style={
                  !formValue.barang
                    ? { width: "100%" }
                    : {
                        backgroundColor: "white",
                        color: "rgba(0, 0, 0, 0.88)",
                        width: "100%",
                      }
                }
                disabled
                onChange={() => {
                  updateVersion();
                }}
                controls={false}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Total Harga :" name="total">
          <Input
            style={
              !formValue.barang
                ? { width: "100%" }
                : {
                    backgroundColor: "white",
                    color: "rgba(0, 0, 0, 0.88)",
                    width: "100%",
                  }
            }
            disabled
          />
        </Form.Item>
      </Form>
    </>
  );
}

const separatorRibuan = (angka, prefix) => {
  var number_string = String(angka)
      .replace(/[^,\d]/g, "")
      .toString(),
    split = number_string.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  // tambahkan titik jika yang di input sudah menjadi angka ribuan
  if (ribuan) {
    let separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
  return prefix == undefined ? rupiah : rupiah ? prefix + rupiah : "";
};

export default App;
