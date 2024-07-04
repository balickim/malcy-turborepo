interface ITile {
  children: React.ReactNode;
}

function Tile(props: ITile) {
  const { children } = props;
  return <div className="bg-white p-5 rounded-3xl shadow-xl">{children}</div>;
}

export default Tile;
