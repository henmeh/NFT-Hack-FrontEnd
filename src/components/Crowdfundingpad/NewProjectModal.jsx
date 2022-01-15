import React, { useState } from "react";
import {
  Form,
  Button,
  Input,
  Card,
  Radio,
  InputNumber,
  Dropdown,
  Menu,
  Space,
  Spin,
} from "antd";
import { Moralis } from "moralis";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import {IERC20ABI, ISuperTokenABI, MagePadABI, MagePadAddress, SuperTokenFactoryABI, SuperTokenFactoryAddress} from "../../helpers/contractABI";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

const NewProjectModal = ({ open, onClose }) => {
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [nftStreamDuration, setnftStreamDuration] = useState();
  const [nftStreamPercentage, setnftStreamPercentage] = useState("0.7");
  const [nftStreamPeriod, setnftStreamPeriod] = useState("days");

  const { Moralis, user } = useMoralis();
  const walletAddress = user ? user.attributes.ethAddress : null;

  const create = async function () {
    setIsLoading(true);
    
    let moralisFile;
    const fileUploadControl = document.getElementById("profilePhotoFileUpload");
    if (fileUploadControl.files.length > 0) {
        const file = fileUploadControl.files[0];
        const name = projectName + ".jpg";
        moralisFile = new Moralis.File(name, file);
        await moralisFile.save();
    }
    const Project = Moralis.Object.extend("Crowdfundingrojects");
    const project = new Project();

    project.set("name", projectName);
    project.set("image", moralisFile);
    project.set("projectAddress", projectAddress);
    project.set("streamduration", nftStreamDuration);
    project.set("streamperiod", nftStreamPeriod);
    project.set("projectCreator", walletAddress);
    project.set("projectCreation", Date.now());
    project.set("isFunded", false);

    await project.save();

    setIsLoading(false);
    onClose();
};

const styles = {
    modal: {
      height: "100vh",
      width: "100vw",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      position: "fixed",
      top: "0",
      left: "0",
      zIndex: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.modal}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ color: "orange" }}> Create new Crowdfundingproject</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={onClose}
              color="orange"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <line x1={18} y1={6} x2={6} y2={18} />
              <line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </div>
        }
        hoverable
        bordered={false}
        style={{
          //width: 380,
          backgroundColor: "rgba(50,50,50)",
          padding: "10px",
          boxshadow: "20px 20px",
          borderRadius: "30px",
          color: "white",
        }}
      >
        <div>
            <h3 style={{ color: "orange",  display: "flex", justifyContent: "center" }}>Projectinformation</h3>
        </div>
        <Form.Item label={<h4 style={{ color: "white" }}>Choose a picture for your project</h4>}>
            <Input type="file" id="profilePhotoFileUpload"/>
        </Form.Item>
        <Form name="newproject" labelCol={{ span: 25 }}>
          <Form.Item label={<h4 style={{ color: "white" }}>Projectname</h4>}>
            <Input onChange={(event) => setProjectName(event.target.value)} />
          </Form.Item>
          <Form.Item label={<h4 style={{ color: "white" }}>Walletaddress of Projectowner</h4>}>
            <Input onChange={(event) => setProjectAddress(event.target.value)} />
         </Form.Item>
         <Form.Item
            label={<h4 style={{ color: "white" }}>Money needed for period of</h4>}
            //rules={[{ required: true, message: 'Please select a token!' }]}
          >
            <InputNumber defaultValue={0} onChange={(value) => setnftStreamDuration(value)} />
            <Radio.Group
              onChange={({ target: { value } }) => setnftStreamPeriod(value)}
              value={nftStreamPeriod}
            >
              <Radio value="days" style={{ color: "white" }}>
                Days
              </Radio>
              <Radio value="weeks" style={{ color: "white" }}>
                Weeks
              </Radio>
              <Radio value="months" style={{ color: "white" }}>
                Months
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
        
        <div style={{ display: "flex", justifyContent: "center" }}>
        {isLoading ? <Spin /> : 
        
          <Button
            onClick={create}
            style={{
              color: "orange",
              backgroundColor: "blue",
              borderRadius: "15px",
              border: "0px",
            }}
          >
            Create Project
          </Button>}
        </div>
      </Card>
    </div>
  );
};

export default NewProjectModal;