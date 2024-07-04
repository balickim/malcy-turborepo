interface IBasicModalBodyWrapper {
  children: React.ReactNode;
}

function BasicModalBodyWrapper(props: IBasicModalBodyWrapper) {
  const { children } = props;
  return <div className="h-full bg-primary p-6 overflow-auto">{children}</div>;
}

export default BasicModalBodyWrapper;