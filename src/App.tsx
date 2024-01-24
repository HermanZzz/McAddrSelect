import React, { ReactElement, useState } from "react";
import "./App.scss";
import {
  Button,
  CheckList,
  ErrorBlock,
  Form,
  Input,
  List,
  Modal,
  SearchBar,
  SpinLoading,
  Steps,
  TextArea,
} from "antd-mobile";
import { LocationFill, HeartFill, EditFill, EditSFill, TeamFill } from "antd-mobile-icons";
import { useFetchAddress, useFetchStores } from "./service";
import copy from "copy-to-clipboard";
import Logo from "./img/logo.jpg";

const { Step } = Steps;
function App() {
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState<any>({});
  const [copyText, setCopyText] = useState("");
  const [store, setStore] = useState<any>({});

  const { data: addrList, fetchAddress, loading } = useFetchAddress();
  const { data: storeList, fetchStores } = useFetchStores();

  const onAddrItemClick = async (item: any) => {
    // 请求门店
    const stores = await fetchStores(item?.location);
    if (stores?.length < 1) {
      return;
    }
    if (stores && stores?.length > 0) {
      // 第一个设置为默认
      setStore(stores[0]);
    }

    setStep(1);
    setAddr(item);
  };

  const onStoreSubmit = () => {
    setStep(2);
  };

  const onCopyClick = (values: any) => {
    setStep(3);
    const { name, phone, detailAddr } = values;
    const text = `城市: ${addr.city}\n地址: ${addr.title} ${addr.address}\n餐厅: ${store.name}\n门牌号: ${detailAddr}\n联系人: ${name}\n手机: ${phone}`;
    copy(text);
    setCopyText(text);
    Modal.alert({
      content: "复制成功",
      closeOnMaskClick: true,
    });
  };

  const renderStep = () => (
    <Steps current={step}>
      <Step
        title="选择地址"
        icon={
          <LocationFill
            fontSize={28}
            onClick={() => {
              setStep(0);
              setCopyText("");
            }}
          />
        }
      />
      <Step
        title="选择门店"
        icon={
          <HeartFill
            fontSize={28}
            onClick={() => {
              if (step > 1) {
                setStep(1);
                setCopyText("");
              }
            }}
          />
        }
      />
      <Step
        title="填写详情"
        icon={
          <EditFill
            fontSize={28}
            onClick={() => {
              if (step > 2) {
                setStep(2);
                setCopyText("");
              }
            }}
          />
        }
      />
      <Step title="复制信息" icon={<EditSFill fontSize={28} />} />
      <Step title="发给客服" icon={<TeamFill fontSize={28} />} />
    </Steps>
  );

  const renderByStep = (step: number) => {
    const renderMap: Record<number, ReactElement> = {
      0: renderSearchAddr(),
      1: renderSelectStore(),
      2: renderForm(),
      3: renderForm(),
    };
    return renderMap[step];
  };

  const renderSearchAddr = () => {
    return (
      <div style={{ minHeight: "350px" }}>
        <SearchBar
          placeholder="请输入城市全称 路名/小区/写字楼/学校等"
          showCancelButton
          onChange={(val) => fetchAddress(val)}
          onSearch={(val) => fetchAddress(val)}
        />
        {loading ? (
          <div className="flex" style={{ marginTop: "30px" }}>
            <SpinLoading />
          </div>
        ) : (
          <List>
            {addrList.length > 0 ? (
              addrList.map((item: any) => (
                <List.Item onClick={() => onAddrItemClick(item)}>
                  <div className="list-item">
                    <div className="list-title">{item.title}</div>
                    <div className="list-info">{item.address}</div>
                  </div>
                </List.Item>
              ))
            ) : (
              <div style={{ margin: "150px 0" }}>
                <ErrorBlock status="empty" title="请先输入地点关键字" description="" />
              </div>
            )}
          </List>
        )}
      </div>
    );
  };

  const renderSelectStore = () => {
    return (
      <>
        <CheckList
          defaultValue={[0]}
          onChange={(values) => {
            if (values?.length === 0) {
              setStore(null);
            } else {
              setStore(storeList[+values[0]]);
            }
          }}
          style={{ minHeight: "400px" }}
        >
          {storeList?.map((item: any, index: number) => (
            <CheckList.Item value={index}>
              <div className="list-item">
                <div className="list-title">{item.name}</div>
                <div className="list-info">{item.distanceText}</div>
              </div>
            </CheckList.Item>
          ))}
        </CheckList>
        <div style={{ padding: "20px 12px" }}>
          <Button
            block
            disabled={!store}
            color="primary"
            size="large"
            style={{ marginTop: "40px" }}
            onClick={onStoreSubmit}
          >
            确定
          </Button>
        </div>
      </>
    );
  };

  const renderForm = () => {
    return (
      <Form
        name="form"
        onFinish={onCopyClick}
        style={{ minHeight: "400px" }}
        initialValues={{ address: `${addr?.address} - ${addr?.title}`, store: store?.name }}
        footer={
          !copyText ? (
            <Button block type="submit" color="primary" size="large" style={{ marginTop: "10px" }}>
              <EditSFill fontSize={20} style={{ marginRight: "4px" }} />
              一键复制发给客服
            </Button>
          ) : (
            <div className="result">
              <div className="title">您已复制了以下内容:</div>
              <div className="text">{copyText}</div>
            </div>
          )
        }
      >
        <Form.Item name="address" label="地址">
          <TextArea rows={2} placeholder="请输入地址" disabled />
        </Form.Item>
        <Form.Item name="store" label="门店">
          <TextArea rows={1} placeholder="请输入门店" disabled />
        </Form.Item>
        <Form.Item name="name" label="联系人" rules={[{ required: true }]}>
          <Input placeholder="请输入联系人" disabled={!!copyText} />
        </Form.Item>
        <Form.Item
          name="phone"
          label="电话"
          rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: "请输入有效电话" }]}
        >
          <Input placeholder="请输入电话" maxLength={11} disabled={!!copyText} />
        </Form.Item>
        <Form.Item name="detailAddr" label="门牌号" rules={[{ required: true }]}>
          <Input placeholder="请输入门牌号" disabled={!!copyText} />
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className="App">
      <div className="steps">{renderStep()}</div>
      <div className="main">{renderByStep(step)}</div>
      <div className="flex imgDiv">
        <img className="img" src={Logo} alt="logo" />
      </div>
    </div>
  );
}

export default App;
