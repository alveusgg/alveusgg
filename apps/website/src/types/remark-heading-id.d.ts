declare module "remark-heading-id" {
  const plugin: Omit<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    import("react-markdown").Options["remarkPlugins"],
    null | undefined
  >[number];
  export default plugin;
}
