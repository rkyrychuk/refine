import { useState, useEffect } from "react";
import {
    AntdLayout,
    Menu,
    Icons,
    Dropdown,
    Input,
    Avatar,
    Typography,
    Space,
    Grid,
    Row,
    Col,
    AutoComplete,
    useGetLocale,
    useSetLocale,
    useGetIdentity,
    useTranslate,
    useList,
} from "@pankod/refine";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";

const { SearchOutlined, DownOutlined } = Icons;
const { Text } = Typography;
const { useBreakpoint } = Grid;

import { IOrder, IStore, ICourier } from "interfaces";
interface IOptionGroup {
    value: string;
    label: string | React.ReactNode;
}

interface IOptions {
    label: string | React.ReactNode;
    options: IOptionGroup[];
}

import { titleStyle, itemStyle, headerStyle, autoCompleteStyle } from "./style";

const renderTitle = (title: string) => (
    <div style={titleStyle}>
        <Text style={{ fontSize: "16px" }}>{title}</Text>
        <a href="#">more</a>
    </div>
);

const renderItem = (title: string, imageUrl: string) => ({
    value: title,
    label: (
        <div style={itemStyle}>
            <Avatar size={64} src={imageUrl} style={{ minWidth: "64px" }} />
            <Text style={{ marginLeft: "16px" }}>{title}</Text>
        </div>
    ),
});

export const Header: React.FC = () => {
    const { i18n } = useTranslation();
    const locale = useGetLocale();
    const changeLanguage = useSetLocale();
    const { data: user } = useGetIdentity();
    const screens = useBreakpoint();
    const t = useTranslate();

    const currentLocale = locale();

    const [value, setValue] = useState<string>("");
    const [options, setOptions] = useState<IOptions[]>([]);

    const { refetch: refetchOrders } = useList<IOrder>(
        "orders",
        {
            filters: [{ field: "q", operator: "contains", value }],
        },
        {
            enabled: false,
            onSuccess: (data) => {
                const orderOptionGroup = data.data.map((item) =>
                    renderItem(
                        `${item.store.title} / #${item.orderNumber}`,
                        "/images/default-order-img.png",
                    ),
                );
                if (orderOptionGroup.length > 0) {
                    setOptions((prevOptions) => [
                        ...prevOptions,
                        {
                            label: renderTitle(t("orders:title")),
                            options: orderOptionGroup,
                        },
                    ]);
                }
            },
        },
    );

    const { refetch: refetchStores } = useList<IStore>(
        "stores",
        {
            filters: [{ field: "q", operator: "contains", value }],
        },
        {
            enabled: false,
            onSuccess: (data) => {
                const storeOptionGroup = data.data.map((item) =>
                    renderItem(item.title, "/images/default-store-img.png"),
                );
                if (storeOptionGroup.length > 0) {
                    setOptions((prevOptions) => [
                        ...prevOptions,
                        {
                            label: renderTitle(t("stores:title")),
                            options: storeOptionGroup,
                        },
                    ]);
                }
            },
        },
    );

    const { refetch: refetchCouriers } = useList<ICourier>(
        "couriers",
        {
            filters: [{ field: "q", operator: "contains", value }],
        },
        {
            enabled: false,
            onSuccess: (data) => {
                const courierOptionGroup = data.data.map((item) =>
                    renderItem(
                        `${item.name} ${item.surname}`,
                        item.avatar[0].url,
                    ),
                );
                if (courierOptionGroup.length > 0) {
                    setOptions((prevOptions) => [
                        ...prevOptions,
                        {
                            label: renderTitle(t("couriers:title")),
                            options: courierOptionGroup,
                        },
                    ]);
                }
            },
        },
    );

    useEffect(() => {
        setOptions([]);
        refetchOrders();
        refetchStores();
        refetchCouriers();
    }, [value]);

    const menu = (
        <Menu selectedKeys={[currentLocale]}>
            {[...i18n.languages].sort().map((lang: string) => (
                <Menu.Item
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    icon={
                        <span style={{ marginRight: 8 }}>
                            <Avatar
                                size={16}
                                src={`/images/flags/${lang}.svg`}
                            />
                        </span>
                    }
                >
                    {lang === "en" ? "English" : "German"}
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <AntdLayout.Header style={headerStyle}>
            <Row align="middle" justify={screens.sm ? "space-between" : "end"}>
                <Col xs={0} sm={12}>
                    <AutoComplete
                        dropdownClassName="header-search"
                        style={autoCompleteStyle}
                        options={options}
                        filterOption={false}
                        onSearch={debounce(
                            (value: string) => setValue(value),
                            300,
                        )}
                    >
                        <Input
                            size="large"
                            placeholder={t("search.placeholder")}
                            suffix={<SearchOutlined />}
                        />
                    </AutoComplete>
                </Col>
                <Col>
                    <Space size="middle">
                        <Dropdown overlay={menu}>
                            <a
                                style={{ color: "inherit" }}
                                onClick={(e) => e.preventDefault()}
                            >
                                <Space>
                                    <Avatar
                                        size={16}
                                        src={`/images/flags/${currentLocale}.svg`}
                                    />
                                    <div
                                        style={{
                                            display: screens.lg
                                                ? "block"
                                                : "none",
                                        }}
                                    >
                                        {currentLocale === "en"
                                            ? "English"
                                            : "German"}
                                        <DownOutlined
                                            style={{
                                                fontSize: "12px",
                                                marginLeft: "6px",
                                            }}
                                        />
                                    </div>
                                </Space>
                            </a>
                        </Dropdown>
                        <Text ellipsis strong>
                            {user?.name}
                        </Text>
                        <Avatar
                            size="large"
                            src={user?.avatar}
                            alt={user?.name}
                        />
                    </Space>
                </Col>
            </Row>
        </AntdLayout.Header>
    );
};
