import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { useCallback, useState } from "react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";
import type { UserRole } from "@/data/user-roles";
import { userRoles } from "@/data/user-roles";

import { getAccountLabel } from "@/utils/account-label";
import { typeSafeObjectKeys } from "@/utils/helpers";
import { trpc } from "@/utils/trpc";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";
import { Button } from "@/components/shared/form/Button";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { TextField } from "@/components/shared/form/TextField";

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

const cellClasses = "py-2 pr-4 align-top last:pr-0";

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

  const [userNameSearchTerm, setUserNameSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const userNameSuggestions = trpc.adminUsersRouter.searchUsernames.useQuery(
    userNameSearchTerm,
    { enabled: userNameSearchTerm.length > 1 },
  );

  const handleAssign = useCallback(() => {
    if (selectedUserId && role) {
      assignRole.mutate({ userId: selectedUserId, role });
    }
  }, [assignRole, role, selectedUserId]);

  return (
    <>
      <Meta title="Users & Roles | Admin" />

      <AdminPageLayout title="Users & Roles" menuItems={menuItems}>
        <Headline>Assign new role</Headline>
        <Panel>
          {assignRole.isError && (
            <MessageBox variant="failure">
              Error assigning role: {assignRole.error.message}
            </MessageBox>
          )}

          <div className="grid gap-5 md:grid-cols-2 md:items-end xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)_auto]">
            <div className="min-w-0 flex-1">
              <TextField
                label="Search users or connected accounts"
                value={userNameSearchTerm}
                onChange={(value) => {
                  setUserNameSearchTerm(value);
                  setSelectedUserId("");
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <SelectBoxField
                label="User"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">- Please choose -</option>
                {userNameSuggestions.data?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || "Unnamed user"}
                    {user.accounts.length > 0 &&
                      ` — ${user.accounts.map(getAccountLabel).join("; ")}`}
                    {` (${user.id})`}
                  </option>
                ))}
              </SelectBoxField>
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
              <Button
                onClick={handleAssign}
                disabled={!selectedUserId || !role || assignRole.isPending}
              >
                Assign role
              </Button>
            </div>
          </div>
        </Panel>

        <Headline>Users with roles</Headline>
        <Panel>
          {getUserWithRoles.isPending && <p>Loading...</p>}
          {getUserWithRoles.isError && (
            <p>Error: {getUserWithRoles.error.message}</p>
          )}
          {getUserWithRoles.isSuccess && (
            <>
              {getUserWithRoles.data.length === 0 && (
                <p>There have not been any roles given to users.</p>
              )}
              {getUserWithRoles.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-2xl">
                    <thead>
                      <tr>
                        <th className="text-left">Username</th>
                        <th className="text-left">Connected accounts</th>
                        <th className="text-left">Roles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getUserWithRoles.data.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className={cellClasses}>
                            {user.name || "Unnamed user"}
                            <span className="block text-sm">{user.id}</span>
                          </td>
                          <td className={cellClasses}>
                            {user.accounts.length > 0 ? (
                              <ul className="space-y-2">
                                {user.accounts.map((account) => (
                                  <li key={account.id}>
                                    <span className="block">
                                      {getAccountLabel(account)}
                                    </span>
                                    {(account.username ||
                                      account.displayName) && (
                                      <span className="block text-sm">
                                        ID: {account.providerAccountId}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span>No connected accounts</span>
                            )}
                          </td>
                          <td className={cellClasses}>
                            <ul className="flex flex-wrap gap-2">
                              {user.isSuperUser && (
                                <li className="flex flex-row rounded-sm bg-red-800 text-sm text-white">
                                  <span className="px-2 py-0.5">
                                    Super User
                                  </span>
                                </li>
                              )}

                              {user.roles
                                .filter(({ role }) => role in userRoles)
                                .map(({ role }) => (
                                  <li
                                    key={role}
                                    className="flex flex-row rounded-sm bg-gray-800 text-sm text-white"
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
                                      <IconMinusCircle className="size-4" />
                                      <span className="sr-only">
                                        Remove role
                                      </span>
                                    </Button>
                                  </li>
                                ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
