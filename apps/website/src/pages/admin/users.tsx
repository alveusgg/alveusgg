import { useCallback, useId, useState } from "react";
import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";

import { getSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { typeSafeObjectKeys } from "@/utils/helpers";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";
import type { UserRole } from "@/data/user-roles";
import { userRoles } from "@/data/user-roles";

import { Headline } from "@/components/admin/Headline";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import { Button } from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { MessageBox } from "@/components/shared/MessageBox";
import { ProcedureErrorMessage } from "@/components/shared/ProcedureErrorMessage";
import Meta from "@/components/content/Meta";
import IconMinusCircle from "@/icons/IconMinusCircle";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(
    context,
    permissions.manageUsersAndRoles,
  );
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/users",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const cellClasses = "py-2";

const AdminUsersPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  const getUserWithRoles = trpc.adminUsersRouter.getUserWithRoles.useQuery();

  const [role, setRole] = useState("");

  const assignRole = trpc.adminUsersRouter.assignRole.useMutation({
    onSuccess: () => {
      getUserWithRoles.refetch();
    },
  });
  const removeRole = trpc.adminUsersRouter.removeRole.useMutation({
    onSuccess: () => {
      getUserWithRoles.refetch();
    },
  });

  const suggestListId = useId();
  const [userNameSearchTerm, setUserNameSearchTerm] = useState("");
  const userNameSuggestions = trpc.adminUsersRouter.searchUsernames.useQuery(
    userNameSearchTerm,
    { enabled: userNameSearchTerm.length > 1 },
  );

  const handleAssign = useCallback(() => {
    if (userNameSearchTerm && role) {
      assignRole.mutate({ userName: userNameSearchTerm, role });
    }
  }, [assignRole, role, userNameSearchTerm]);

  return (
    <>
      <Meta title="Users & Roles | Admin" />

      <AdminPageLayout title="Users & Roles" menuItems={menuItems}>
        <Headline>Assign new role</Headline>
        <Panel>
          {assignRole.error && (
            <MessageBox variant="failure">
              <ProcedureErrorMessage error={assignRole.error} />
            </MessageBox>
          )}

          <div className="flex flex-row items-end gap-5">
            <div className="flex-1">
              <TextField
                label={"User name"}
                list={suggestListId}
                value={userNameSearchTerm}
                onChange={(value) => setUserNameSearchTerm(value)}
              />
              <datalist id={suggestListId}>
                {userNameSuggestions.data?.map((user) => (
                  <option key={user.id} value={user.name || ""} />
                ))}
              </datalist>
            </div>
            <div className="flex-1">
              <SelectBoxField
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">- Please choose -</option>
                {typeSafeObjectKeys(userRoles).map((role) => (
                  <option key={role} value={role}>
                    {userRoles[role].label}
                  </option>
                ))}
              </SelectBoxField>
            </div>
            <div>
              <Button onClick={handleAssign}>Assign role</Button>
            </div>
          </div>
        </Panel>

        <Headline>Users with roles</Headline>
        <Panel>
          {getUserWithRoles.isLoading && <p>Loading...</p>}
          {getUserWithRoles.error && (
            <MessageBox variant="failure">
              <ProcedureErrorMessage error={getUserWithRoles.error} />
            </MessageBox>
          )}
          {getUserWithRoles.isSuccess && (
            <>
              {getUserWithRoles.data.length === 0 && (
                <p>There have not been any roles given to users.</p>
              )}
              {getUserWithRoles.data.length > 0 && (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Username</th>
                      <th className="text-left">Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getUserWithRoles.data.map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className={cellClasses}>{user.name}</td>
                        <td className={cellClasses}>
                          <ul className="flex flex-row gap-2">
                            {user.isSuperUser && (
                              <li className="flex flex-row rounded bg-red-800 text-sm text-white">
                                <span className="px-2 py-0.5">Super User</span>
                              </li>
                            )}

                            {user.roles
                              .filter(({ role }) => role in userRoles)
                              .map(({ role }) => (
                                <li
                                  key={role}
                                  className="flex flex-row rounded bg-gray-800 text-sm text-white"
                                >
                                  <span className="py-0.5 pl-2">
                                    {userRoles[role as UserRole].label}
                                  </span>
                                  <Button
                                    size="small"
                                    width="auto"
                                    className=""
                                    onClick={() =>
                                      removeRole.mutate({
                                        userId: user.id,
                                        role,
                                      })
                                    }
                                  >
                                    <IconMinusCircle className="h-4 w-4" />
                                    <span className="sr-only">Remove role</span>
                                  </Button>
                                </li>
                              ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </Panel>

        <Headline>Roles</Headline>
        <Panel>
          <ul>
            {typeSafeObjectKeys(userRoles).map((role) => (
              <li key={role} className="border-t p-1 first:border-t-0">
                <strong>{userRoles[role].label}</strong>
                <br />
                {userRoles[role].description}
              </li>
            ))}
          </ul>
        </Panel>
      </AdminPageLayout>
    </>
  );
};

export default AdminUsersPage;
