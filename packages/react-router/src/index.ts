import React from "react";
import { IRouterProvider } from "@pankod/refine";
import {
    useNavigate,
    useLocation,
    useParams,
    /* Prompt, */
    Link,
    RouteProps,
    BrowserRouterProps,
} from "react-router-dom";

import { RouterComponent } from "./routerComponent";

interface IReactRouterProvider extends IRouterProvider {
    useLocation: typeof useLocation;
    Link: typeof Link;
    useParams: any; // fix
    routes?: RouteProps[];
    RouterComponent: React.FC<BrowserRouterProps>;
}

const RouterProvider: IReactRouterProvider = {
    useHistory: () => {
        const navigate = useNavigate();
        const location = useLocation();

        return {
            push: (path: string) => {
                navigate(path);
            },
            replace: (path: string) => {
                navigate(path, { replace: true });
            },
            goBack: () => {
                return true;
            },
        };
    },
    useLocation,
    useParams,
    Prompt: null as any,
    Link,
    RouterComponent,
};
export default RouterProvider;
