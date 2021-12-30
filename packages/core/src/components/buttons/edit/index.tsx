import React, { FC } from "react";
import { Button, ButtonProps } from "antd";
import { EditOutlined } from "@ant-design/icons";

import {
    useCan,
    useNavigation,
    useResourceWithRoute,
    useRouterContext,
    useTranslate,
} from "@hooks";
import { ResourceRouterParams } from "../../../interfaces";

type EditButtonProps = ButtonProps & {
    resourceName?: string;
    recordItemId?: string;
    hideText?: boolean;
    ignoreAccessControlProvider?: boolean;
};

/**
 * `<EditButton>` uses Ant Design's {@link https://ant.design/components/button/ `<Button>`} component.
 * It uses the {@link https://refine.dev/docs/api-references/hooks/navigation/useNavigation#edit `edit`} method from {@link https://refine.dev/docs/api-references/hooks/navigation/useNavigation `useNavigation`} under the hood.
 * It can be useful when redirecting the app to the edit page with the record id route of resource}.
 *
 * @see {@link https://refine.dev/docs/api-references/components/buttons/edit-button} for more details.
 */
export const EditButton: FC<EditButtonProps> = ({
    resourceName: propResourceName,
    recordItemId,
    hideText = false,
    ignoreAccessControlProvider = false,
    children,
    ...rest
}) => {
    const resourceWithRoute = useResourceWithRoute();

    const translate = useTranslate();

    const { useParams } = useRouterContext();

    const { resource: routeResourceName, id: idFromRoute } =
        useParams<ResourceRouterParams>();

    const resource = resourceWithRoute(routeResourceName);

    const resourceName = propResourceName ?? resource.name;

    const { edit } = useNavigation();

    const id = recordItemId ?? idFromRoute;

    const { data } = useCan({
        resource: resourceName,
        action: "edit",
        params: { id },
        queryOptions: {
            enabled: !ignoreAccessControlProvider,
        },
    });

    const createButtonDisabledTitle = () => {
        if (data?.can) return "";
        else if (data?.reason) return data.reason;
        else
            return translate(
                "buttons.notAccessTitle",
                "You don't have permission to access",
            );
    };

    return (
        <Button
            onClick={(): void => {
                edit(resourceName, id);
            }}
            icon={<EditOutlined />}
            disabled={data?.can === false}
            title={createButtonDisabledTitle()}
            {...rest}
        >
            {!hideText && (children ?? translate("buttons.edit", "Edit"))}
        </Button>
    );
};
