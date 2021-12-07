/* eslint-disable react/display-name */
import React from "react";
import { RouteProps, Routes, Route, Navigate } from "react-router-dom";
import {
    LoginPage as DefaultLoginPage,
    ErrorComponent,
    LayoutWrapper,
    useAuthenticated,
    useIsAuthenticated,
    IResourceItem,
    useResource,
    useRefineContext,
    useRouterContext,
    CanAccess,
} from "@pankod/refine";

type IRoutesProps = RouteProps & { routes?: RouteProps[] };

type IRouteComponentProps = { match: { params: { id: string } } };

const RouteProviderBase: React.FC = () => {
    const { resources } = useResource();
    const { catchAll, DashboardPage, LoginPage } = useRefineContext();

    const { routes: customRoutes }: { routes: RouteProps[] } =
        useRouterContext();

    const isAuthenticated = useIsAuthenticated();
    const { isLoading } = useAuthenticated({ type: "routeProvider" });

    if (isLoading) {
        return (
            <Routes>
                <Route />
            </Routes>
        );
    }

    const routes: IRoutesProps[] = [];
    const RouteHandler = (val: IResourceItem): void => {
        const { list, create, edit, show, canDelete, route, name } = val;

        const ListComponent = list;
        const CreateComponent = create;
        const EditComponent = edit;
        const ShowComponent = show;

        const canCreate = !!create;
        const canEdit = !!edit;
        const canShow = !!show;

        if (CreateComponent) {
            routes.push({
                path: `/:resource(${route})/:action(create)`,
                element: (
                    <CanAccess
                        resource={name}
                        action="create"
                        fallback={catchAll ?? <ErrorComponent />}
                    >
                        <CreateComponent
                            canCreate={canCreate}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canShow={canShow}
                            name={name}
                        />
                    </CanAccess>
                ),
            });

            routes.push({
                path: `/:resource(${route})/:action(clone)/:id`,
                children: (props: IRouteComponentProps) => (
                    <CanAccess
                        resource={name}
                        action="create"
                        params={{ id: props.match.params.id }}
                        fallback={catchAll ?? <ErrorComponent />}
                    >
                        <CreateComponent
                            canCreate={canCreate}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canShow={canShow}
                            name={name}
                        />
                    </CanAccess>
                ),
            });
        }

        if (EditComponent) {
            routes.push({
                path: `/:resource(${route})/:action(edit)/:id`,
                children: (props: IRouteComponentProps) => (
                    <CanAccess
                        resource={name}
                        action="edit"
                        params={{ id: props.match.params.id }}
                        fallback={catchAll ?? <ErrorComponent />}
                    >
                        <EditComponent
                            canCreate={canCreate}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canShow={canShow}
                            name={name}
                        />
                    </CanAccess>
                ),
            });
        }

        if (ShowComponent) {
            routes.push({
                path: `/:resource(${route})/:action(show)/:id`,
                children: (props: IRouteComponentProps) => (
                    <CanAccess
                        resource={name}
                        action="show"
                        params={{ id: props.match.params.id }}
                        fallback={catchAll ?? <ErrorComponent />}
                    >
                        <ShowComponent
                            canCreate={canCreate}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canShow={canShow}
                            name={name}
                        />
                    </CanAccess>
                ),
            });
        }

        if (ListComponent) {
            routes.push({
                path: `/:resource`,
                children: () => (
                    <CanAccess
                        resource={name}
                        action="list"
                        fallback={catchAll ?? <ErrorComponent />}
                    >
                        <ListComponent
                            canCreate={canCreate}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canShow={canShow}
                            name={name}
                        />
                    </CanAccess>
                ),
            });
        }

        return;
    };

    resources.map((item) => {
        RouteHandler(item);
    });

    const RouteWithSubRoutes = (route: any) => (
        <LayoutWrapper>
            <Route {...route} />
        </LayoutWrapper>
    );

    const renderAuthorized = () => (
        <Routes>
            {[...(customRoutes || [])].map((route, i) => (
                <Route key={`custom-route-${i}`} {...route} />
            ))}
            {/* <Route
                path="/"
                element={
                    DashboardPage ? (
                        <LayoutWrapper>
                            <CanAccess
                                resource="dashboard"
                                action="list"
                                fallback={catchAll ?? <ErrorComponent />}
                            >
                                <DashboardPage />
                            </CanAccess>
                        </LayoutWrapper>
                    ) : (
                        <Navigate to={`/${resources[0].route}`} replace />
                    )
                }
            /> */}
            {[...routes].map((route, i) => (
                <Route key={i} {...route} />
            ))}
            {/*  <Route path="/:resource?/:action?">
                {catchAll ?? (
                    <LayoutWrapper>
                        <ErrorComponent />
                    </LayoutWrapper>
                )}
            </Route>
            <Route>
                {catchAll ?? (
                    <LayoutWrapper>
                        <ErrorComponent />
                    </LayoutWrapper>
                )}
            </Route> */}
        </Routes>
    );

    const renderUnauthorized = () => (
        <Routes>
            <Route
                path="/"
                element={LoginPage ? <LoginPage /> : <DefaultLoginPage />}
            />
            <Route
                path="/login"
                element={LoginPage ? <LoginPage /> : <DefaultLoginPage />}
            />
            {[...(customRoutes || [])].map((route, i) => (
                <Route key={`custom-route-${i}`} {...route} />
            ))}

            <Route
                path="*"
                // eslint-disable-next-line react/no-children-prop
                children={({ location }: { location: any }) => {
                    console.log("hedeee");
                    if (isLoading) {
                        return null;
                    }

                    const { pathname, search } = location;
                    const toURL = `${pathname}${search}`;

                    return (
                        <Navigate
                            to={`/login?to=${encodeURIComponent(toURL)}`}
                            replace
                        />
                    );
                }}
            ></Route>
        </Routes>
    );
    return isAuthenticated ? renderAuthorized() : renderUnauthorized();
};

/**
 * @internal
 */
export const RouteProvider = React.memo(RouteProviderBase);
