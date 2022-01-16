import { useState, useEffect } from "react";
import { useMoralis, useNativeBalance, useMoralisCloudFunction} from "react-moralis";
import { Skeleton, Table, Card } from "antd";
import { getEllipsisTxt } from "../../helpers/formatters";
import { CFAABI, CFAAddress, MagePadNFTAddress, SuperTokenABI } from "../../helpers/contractABI";
import Balance from "./Balance.jsx";
import Crowdfundingpad from "../Crowdfundingpad/Crowdfundingpad.jsx";

function ERC20Balance() {
  const [balanceForFlow, setBalanceForFlow] = useState();
  const { data: balance } = useNativeBalance();
  const { Moralis, user } = useMoralis();
  const walletAddress = user ? user.attributes.ethAddress : null;
  const { data, error, isLoading } = useMoralisCloudFunction(
    "getTokenBalances",
    { walletAddress },
    [],
    { live: true }
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 75,
      render: (name) => name,
    },
    {
      title: "Symbol",
      dataIndex: "symbol",
      key: "symbol",
      width: 75,
      render: (symbol) => symbol,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: 500,
      render: (value, item) => (
        <Balance balance={value} decimals={item.decimals} tokenAddress={item.token_address}/>
      ),
    },
    {
      title: "Address",
      dataIndex: "token_address",
      key: "token_address",
      width: 75,
      render: (address) => getEllipsisTxt(address, 5),
    },
  ];

  return (
    <div style={{display:'flex', flexDirection:"row", gap: "20px"}}>  
    <div style={{backgroundColor: "transparent", padding: "10px", boxshadow: "20px 20px", borderRadius: "30px", borderColor: "black"}}>
      <Skeleton loading={!data}>
        <Table
        //pagination= {false}
        className="ant-table"
          title={() => (
            <h1 style={{color: "orange"}}>{`ETH Balance ${parseFloat(
              Moralis.Units.FromWei(balance.balance, 18).toFixed(6)
            )}`}</h1>
          )}
          dataSource={data}
          columns={columns}
          rowKey={(record) => {
            return record.token_address;
          }}
        />
      </Skeleton>
    </div>
    <Crowdfundingpad />
    </div>

  );
}
export default ERC20Balance;
