declare module "remark-heading-id" {
  const plugin: Omit<
    import("react-markdown").Options["remarkPlugins"],
    null | undefined
  >[number];
  export default plugin;
}
