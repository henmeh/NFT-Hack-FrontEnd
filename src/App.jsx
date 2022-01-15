import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Account from "components/Account";
import Chains from "components/Chains";
import ERC20Balance from "components/TokenBalance/ERC20Balance";
import NFTBalance from "components/NFTBalances/NFTBalances";
import { Layout, Tabs } from "antd";
import "antd/dist/antd.css";
import "./style.css";
import MenuItems from "./components/MenuItems";
const { Header, Footer } = Layout;

const styles = {
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    marginTop: "130px",
    padding: "10px",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "transparent",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    //borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    //boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
    //backgroundColor: "rgba(108,122,137,0.5)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};
const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    //<Layout style={{ height: "100vh", overflow: "auto", background: "linear-gradient(45deg, rgba(2,0,36,1) 10%, rgba(9,9,121,1) 50%, rgba(0,212,255,1) 90%)"}}>
    <Layout style={{ height: "100vh", overflow: "auto", background: "white"}}>
      <Router>
        <Header style={styles.header}>
          <MenuItems />
          <div style={styles.headerRight}>
            <Chains />
            {/*<TokenPrice
              address="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
              chain="eth"
              image="https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg/"
              size="40px"
            />
            <NativeBalance />*/}
            <Account />
          </div>
        </Header>
        <div style={styles.content}>
          <Switch>
            {/*<Route exact path="/quickstart">
              <QuickStart isServerInfo={isServerInfo} />
            </Route>
            <Route path="/wallet">
              <Wallet />
            </Route>
            <Route path="/1inch">
              <Tabs defaultActiveKey="1" style={{ alignItems: "center" }}>
                <Tabs.TabPane tab={<span>Ethereum</span>} key="1">
                  <InchDex chain="eth" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>Binance Smart Chain</span>} key="2">
                  <InchDex chain="bsc" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>Polygon</span>} key="3">
                  <InchDex chain="polygon" />
                </Tabs.TabPane>
              </Tabs>
          </Route>*/}
            <Route path="/startingpage">
              <ERC20Balance />
            </Route>
            {/*<Route path="/onramp">
              <Ramper />
            </Route>
            <Route path="/erc20transfers">
              <ERC20Transfers />
        </Route>*/}
            <Route path="/nftBalance">
              <NFTBalance />
            </Route>
            {/*<Route path="/contract">
              <Contract />
      </Route>*/}
            <Route path="/">
              <Redirect to="/erc20balance" />
            </Route>
            {/*<Route path="/ethereum-boilerplate">
              <Redirect to="/quickstart" />
    </Route>*/}
            <Route path="/nonauthenticated">
              <>Please login using the "Authenticate" button</>
            </Route>
          </Switch>
        </div>
      </Router>
      {}
    </Layout>
  );
};

export default App;
