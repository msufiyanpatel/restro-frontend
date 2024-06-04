import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import 'regenerator-runtime/runtime';
import axios from "../../../../utils/axios";
import endpoints from "../../../../constant/endPoints";
import NavBar from "../../../../components/NavBar";
import CategoryComponent from "../../../../components/CategoryComponent";
import Drawer from "../../../../components/Drawer";
import { StoreContext } from "../../../../context/appContext";
import { handleChangeResObj } from "../../../../utils/utilFunctions";
import { maxWidth } from "../../../../hooks/useWindowSize";
import { setCookie } from "cookies-next";
import getLang, { getLangServerSide } from "../../../../utils/locale";
import Chatbox from "./chatbot.js"; // Import the Chatbox component

export default function Home(props) {
  const router = useRouter();
  const [store, updateStore] = useContext(StoreContext);
  const [colorSchema, setColorSchema] = useState();
  const [colorLoaded, setColorLoaded] = useState(false);
  const [isDrawerModalOpen, setDrawerModalOpen] = useState(false);
  const [isRoomNumber, setRoomNumber] = useState();
  const [showRoom, setShowRoom] = useState();
  const [hideRoom, setHideRoom] = useState();
  const [chatboxOpen, setChatboxOpen] = useState(false); // State to manage chatbox visibility
  const lang = props.lang;
  const setRtl = props.setRtl;
  const [storeState, setStoreState] = useState(
    props?.getStoreByIDRes ? props.getStoreByIDRes : null
  );

  useEffect(() => {
    if (props.getStoreByIDRes && !props.isAPIFiled) {
      let tempStore = JSON.parse(JSON.stringify(props.getStoreByIDRes));
      delete tempStore.services;
      updateStore(tempStore);
    }

    if (props.getStoreByIDRes) {
      setColorSchema({
        backgroundColor: props.getStoreByIDRes.backgroundColor || "#FCFCFF",
        fontColor: props.getStoreByIDRes.fontColor || "#4F4F4F",
        borderColor: props.getStoreByIDRes.borderColor || "#1B153D",
      });
      setColorLoaded(true);
    }
  }, []);

  useEffect(() => {
    const roomNo = router.query.roomNo;
    if (typeof window !== "undefined") {
      localStorage.setItem("RoomNumber", roomNo);
    }

    const roomNumber = localStorage.getItem("RoomNumber");
    if (roomNumber) {
      setRoomNumber(roomNumber);
    }

    getBoolean();
    getHideRoom();
  }, []);

  const getBoolean = () => {
    const showRoomNO = router.query?.hideRefCodeFromUser ? true : false;
    if (typeof window !== "undefined") {
      localStorage.setItem("hideRoom", showRoomNO);
      setShowRoom(showRoomNO);
    }
  };

  const getHideRoom = () => {
    const localRoom = localStorage.getItem("hideRoom");
    setHideRoom(localRoom === "true");
  };

  const handleChatboxToggle = () => {
    setChatboxOpen(!chatboxOpen);
  };

  return (
    <>
      <Head>
        <title>{storeState?.name}</title>
        <meta property="og:image" content={storeState?.logo?.previewUrl || ""} />
        <meta name="description" content={storeState?.services} />
        <meta property="og:title" content={storeState?.name} />
      </Head>

      {!props.isAPIFiled ? (
        colorLoaded && (
          <div
            style={{ backgroundColor: colorSchema.backgroundColor }}
            className={`flex flex-col h-full w-screen items-center min-h-screen `}
          >
            <div className="w-screen items-center justify-center max-w-[800px]">
              <NavBar
                lang={lang}
                setRtl={setRtl}
                leftIconVissible={true}
                roomNo={isRoomNumber}
                hotelLogo={storeState?.logo?.previewUrl || ""}
                handleBackBtn={() => setDrawerModalOpen(true)}
              />
            </div>

            {/* Chatbox Button */}
            <div
              className="fixed bottom-5 right-5 z-10"
              onClick={handleChatboxToggle}
              style={{ cursor: "pointer" }}
            >
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Chat
              </button>
            </div>

            {/* Chatbox UI */}
            {chatboxOpen && <Chatbox onClose={handleChatboxToggle} />}

            {/* Drawer modal start here */}
            {isDrawerModalOpen && (
              <Drawer
                lang={lang}
                setRtl={setRtl}
                handleClose={() => setDrawerModalOpen(false)}
                showDrawer={isDrawerModalOpen}
                resourceApi={props?.resources}
                isArabic={isArabic}
                store={store}
                handleNavigation={() =>
                  router.push({
                    pathname: `/${lang}/store/${props.storeIdParam}/order-history`,
                    query: {
                      roomNo: router.query.roomNo,
                    },
                  })
                }
                handleContactNavigation={() =>
                  router.push({
                    pathname: `/${lang}/store/${props.storeIdParam}/contact-detail`,
                    query: {
                      roomNo: router.query.roomNo,
                    },
                  })
                }
                handleRequestHistoryNavigation={() =>
                  router.push({
                    pathname: `/${lang}/store/${props.storeIdParam}/request-history`,
                    query: {
                      roomNo: router.query.roomNo,
                    },
                  })
                }
              />
            )}
            {/* Drawer modal End here */}

            <div
              style={{ backgroundColor: colorSchema.backgroundColor }}
              className={` w-full h-fit flex-col mb-5 items-center   `}
            >
              <div className="w-screen h-12"></div>

              <div
                id="text"
                className="mt-[15px] w-[100%] flex  items-center justify-center "
              >
                <div
                  dir={setRtl}
                  style={{ color: colorSchema.borderColor }}
                  className={` ${
                    lang == "ar" ? "font-cairo" : "font-raleway"
                  } font-[600] text-[33px] leading-[40px] mt-[10px] mr-[25px] ml-[25px]`}
                >
                  {props?.getStoreByIDRes?.welcomeHeading ||
                    props?.resources?.EVERYTHING}
                </div>
              </div>
              <div>
                <img
                  src="/images/touch/banner.jpg"
                  className="w-full h-[400px] object-cover bg-no-repeat mt-10 mb-10"
                  alt="banner"
                />
              </div>

              {/* Services */}
              <div
                className={`w-screen items-start  flex flex-wrap ${
                  lang == "ar" ? "justify-between" : "justify-between"
                }  mt-[10px] pb-2 px-4  `}
              >
                {storeState != null ? (
                  storeState.services.map((category, index) => (
                    <CategoryComponent
                      key={index}
                      lang={lang}
                      setRtl={setRtl}
                      item={category}
                      className={
                        category?.viewType === "Grid" ? "w-[49%]" : "w-[100%]"
                      }
                      onClick={() => {
                        category.serviceType !== "Request"
                          ? router.push({
                              pathname: `/${lang}/store/${props.storeIdParam}/service/${category.uuid}`,
                              query: {
                                roomNo: isRoomNumber,
                                hideRefCodeFromUser: hideRoom ? false : true,
                              },
                            })
                          : router.push({
                              pathname: `/${lang}/store/${props.storeIdParam}/service/${category.uuid}/request/${category.id}`,
                              query: {
                                roomNo: isRoomNumber,
                              },
                            });
                      }}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center w-screen mt-[150px] ">
                    <p className="font-raleway text-[20px] ">
                      Data is not available for this store
                    </p>
                  </div>
                )}
              {/* Services end */}

              {/* Cities */}
              {storeState?.city != null && (
                <CategoryComponent
                  lang={lang}
                  setRtl={setRtl}
                  item={{
                    ...storeState?.city,
                    name: props?.resources?.ABOUT_CITY,
                    summary:
                      lang == "ar"
                        ? storeState?.city?.descriptionLocale
                        : storeState?.city?.description,
                  }}
                  className={"w-[90%] max-w-[780px]"}
                  onClick={() =>
                    router.push({
                      pathname: `/${lang}/store/${props.storeIdParam}/city/${storeState?.city?.id}`,
                      query: {
                        roomNo: isRoomNumber,
                      },
                    })
                  }
                />
              )}
              {/* Cities end */}
            </div>
          </div>
          </div>
        )
      ) : (
        <div
          className={`flex items-center justify-center w-screen mt-[200px] ${
            lang == "ar" ? "font-cairo" : "font-raleway"
          }`}
        >
          <p className="font-raleway text-[20px] ">
            {props?.resources?.SOMETHING_WENT_WRONG}
          </p>
        </div>
      )}
      
    </>
  );
}

export async function getServerSideProps(context) {
  let storeIdParam = context?.params?.id;
  let lang = getLangServerSide(context)?.locale;
  let setRtl = getLangServerSide(context).rtl;

  if (!context.query?.id) {
    return {
      notFound: true,
    };
  }

  let getStoreByIdRes;
  let getResourceAPI = {};
  let isAPIFiled = false;

  try {
    getStoreByIdRes = await axios.get(
      `${endpoints.GET_STORE_BY_ID}/${context.query.id}`,
      {
        headers: {
          locale: lang,
        },
      }
    );
    let resourceAPI = await axios.get(
      `${endpoints.GET_RESOURCES}/locale/${lang}`
    );

    if (resourceAPI.status == 200) {
      getResourceAPI = handleChangeResObj(resourceAPI.data);
    }
  } catch (err) {
    isAPIFiled = true;
  }

  return {
    props: {
      getStoreByIDRes: getStoreByIdRes?.data?.data, // Provide default value
      resources: getResourceAPI,
      isAPIFiled: isAPIFiled,
      storeIdParam: storeIdParam,
      lang,
      setRtl,
    },
  };
}

