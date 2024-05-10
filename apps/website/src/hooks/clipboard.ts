export const useClipboard = function () {
  return {
    copyToClipboard: function (command: string) {
      navigator.clipboard.writeText(command);
    },
  };
};
