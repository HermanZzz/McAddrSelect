import axios from "axios";
import { useState } from "react";
import { debounce } from "lodash";
import fetchJsonp from "fetch-jsonp";
import { Toast } from "antd-mobile";

export const useFetchAddress = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAddress = async (value: string) => {
    setLoading(true);
    // us: LP6BZ-KOCKH-WDADQ-WRB44-ZULEQ-YYFFK
    // KFC: KW2BZ-43A3J-HT6FG-DY7TO-ADCT7-IMFEL
    fetchJsonp(
      "https://apis.map.qq.com/ws/place/v1/suggestion?" +
        `keyword=${value}&key=LP6BZ-KOCKH-WDADQ-WRB44-ZULEQ-YYFFK&output=jsonp`
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        console.log("parsed json", json);
        const data = json?.data;
        setData(data || []);
        setLoading(false);
      })
      .catch(function (ex) {
        console.log("parsing failed", ex);
        setLoading(false);
      });
  };

  return { data, fetchAddress: debounce(fetchAddress, 500), loading };
};

export const useFetchStores = () => {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const fetchStores = async ({ lat: latitude, lng: longitude }: any) => {
    setLoading(true);
    try {
      const res = await axios.get("http://43.138.202.252:1992/mcd/external/near/stores", {
        params: { latitude, longitude },
      });
      const data = res?.data?.data || {};
      if (!data?.stores?.length || data?.stores?.length < 1) {
        Toast.show({
          icon: "fail",
          content: res?.data?.msg || "抱歉,未找到匹配的外送门店",
        });
        return [];
      } else {
        setData(data.stores || []);
        return data.stores;
      }
    } catch (e) {
      console.log("e :>> ", e);
    }
    setLoading(false);
  };

  return { data, fetchStores, loading };
};
