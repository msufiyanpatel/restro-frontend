import { useRouter } from "next/router";
import React, { useEffect } from "react";
import logger from "../utils/logger";
import 'regenerator-runtime/runtime';
import { getCookie } from "cookies-next";
const StoreInfo = () => {
  let router = useRouter();

  useEffect(() => {
    const roomNumber = localStorage.getItem("RoomNumber");
    const store = JSON.parse(localStorage.getItem("store"));
    const localRoom = localStorage.getItem("hideRoom");
    const lang = getCookie("pwalang");

    if (store) {
      const query = {};
      if (roomNumber && localRoom) {
        query.roomNo = roomNumber;
        query.hideRefCodeFromUser = localRoom;
      }
      logger.log(query);
      router.replace({
        pathname: `${lang}/store/detail/${store.uuid}`,
        query: query,
      });
    } else {
      router.replace({
        pathname: `/404`,
      });
    }
  }, []);
  return <div />;
};

export default StoreInfo;
