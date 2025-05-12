import api from "@/api";
import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { toast } from "sonner";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana, SiDogecoin } from "react-icons/si";
import { useNavigate } from "react-router";

export default function App() {
  const navigate = useNavigate();
  const [result, setResult] = useState("Click to Bet");
  const [cryptocurrency, setCryptoCurrency] = useState("BTC");
  const [wagerCurrency, setWagerCurrency] = useState("BTC");
  const [withdrawCurrency, setWithdrawCurrency] = useState("BTC");
  const [address, setAddress] = useState({
    BTC: "",
    ETH: "",
    SOL: "",
    DOGE: "",
  });
  const [balance, setBalance] = useState({
    BTC: "",
    ETH: "",
    SOL: "",
    DOGE: "",
  });
  const [casinoBal, setCasinoBal] = useState({
    BTC: "",
    ETH: "",
    SOL: "",
    DOGE: "",
  });

  const getUserBalance = async () => {
    try {
      const res = await api.get("/balance");
      setBalance({
        BTC: res.data.balance.BTC,
        ETH: res.data.balance.ETH,
        SOL: res.data.balance.SOL,
        DOGE: res.data.balance.DOGE,
      });
      setAddress({
        BTC: res.data.address.BTC,
        ETH: res.data.address.ETH,
        SOL: res.data.address.SOL,
        DOGE: res.data.address.DOGE,
      });
    } catch (error) {
      console.log("error getting balance", error?.response.data);
      toast.error(error?.response?.data?.message);
    }
  };

  const getCasinoBal = async () => {
    const res = await api.get("/balance/casino");
    setCasinoBal({
      BTC: res.data.balance.BTC ?? 0,
      ETH: res.data.balance.ETH ?? 0,
      SOL: res.data.balance.SOL ?? 0,
      DOGE: res.data.balance.DOGE ?? 0,
    });
  };
  useEffect(() => {
    getUserBalance();
    getCasinoBal();
  }, []);

  const deposit = async () => {
    try {
      const amount = document.getElementById("amount").value;
      // console.log(amount);

      const res = await api.post("/deposit", {
        amount,
        address: address[cryptocurrency],
        cryptocurrency,
      });
      toast.success(res.data.message);
      setBalance({
        BTC: res.data.balance.BTC,
        ETH: res.data.balance.ETH,
        SOL: res.data.balance.SOL,
        DOGE: res.data.balance.DOGE,
      });
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };

  const play = async () => {
    try {
      const wagerAmount = document.getElementById("wagerAmount").value;
      const res = await api.post("/play", {
        wager: wagerAmount,
        cryptocurrency: wagerCurrency,
      });
      // console.log(res.data);
      toast.success(res.data.message);
      setResult(res.data.message);
      setBalance({
        BTC: res.data?.balance.BTC,
        ETH: res.data?.balance.ETH,
        SOL: res.data?.balance.SOL,
        DOGE: res.data?.balance.DOGE,
      });
    } catch (error) {
      console.log("play function error", error.response.data.message);
      toast.error(error?.response?.data?.message);
    }
  };

  const withdraw = async () => {
    try {
      const withDrawAmount = document.getElementById("withDrawAmount").value;
      const res = await api.post("/withdraw", {
        amount: withDrawAmount,
        address: address[cryptocurrency],
        cryptocurrency: withdrawCurrency,
      });
      // console.log("res", res.data);
      setBalance({
        BTC: res.data.balance.BTC,
        ETH: res.data.balance.ETH,
        SOL: res.data.balance.SOL,
        DOGE: res.data.balance.DOGE,
      });
      setCasinoBal({
        BTC: res.data.casinoBal.BTC ?? 0,
        ETH: res.data.casinoBal.ETH ?? 0,
        SOL: res.data.casinoBal.SOL ?? 0,
        DOGE: res.data.casinoBal.DOGE ?? 0,
      });
      toast.success(res.data.message);
    } catch (error) {
      console.log("error", error);
      // console.log("error", error?.response?.data);
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className="max-h-screen max-w-screen grid grid-cols-2 gap-x-20 gap-y-10  m-20 justify-center items-center">
      <Button
        className="absolute top-4 right-10"
        size={"lg"}
        onClick={() => navigate("/")}
      >
        Log Out
      </Button>
      {/* Casino's Balance */}
      <div className="p-10 flex-row border rounded-2xl shadow-2xl w-2xl">
        <h1 className="text-2xl pb-3 font-bold">Casino's Balance</h1>
        Bitcoin: <span className="font-bold">{casinoBal.BTC}</span>
        <FaBitcoin className="inline ml-1 relative mr-5 bottom-[1px]" />
        Ethereum: <span className="font-bold">{casinoBal.ETH}</span>
        <FaEthereum className="inline relative mr-5 bottom-[2px] ml-1" />
        Solana: <span className="font-bold">{casinoBal.SOL}</span>
        <SiSolana className="relative mr-5 bottom-[1px] inline ml-1" />
        Dogecoin: <span className="font-bold">{casinoBal.DOGE}</span>
        <SiDogecoin className="inline relative mr-5 bottom-[2px] ml-1" />
      </div>

      {/* User's Balance */}
      <div className="p-10 border rounded-2xl shadow-2xl w-2xl">
        <h1 className="text-2xl pb-3 font-bold">User's Balance</h1>
        Bitcoin: <span className="font-bold">{balance.BTC}</span>
        <FaBitcoin className="inline ml-1 relative mr-5 bottom-[1px]" />
        Ethereum: <span className="font-bold">{balance.ETH}</span>
        <FaEthereum className="inline relative mr-5 bottom-[2px] ml-1" />
        Solana: <span className="font-bold">{balance.SOL}</span>
        <SiSolana className="relative mr-5 bottom-[1px] inline ml-1" />
        Dogecoin: <span className="font-bold">{balance.DOGE}</span>
        <SiDogecoin className="inline relative mr-5 bottom-[2px] ml-1" />
      </div>

      {/* Deposit Cash */}
      <div className="p-10 border flex flex-col rounded-2xl shadow-2xl w-2xl">
        <h1 className="pb-5 font-bold text-2xl">Deposit Cash</h1>
        <div className="flex space-x-5">
          <Input type="number" id="amount" className="w-2xl" />
          <select
            value={cryptocurrency || ""}
            onChange={(e) => setCryptoCurrency(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:border-black"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
            <option value="DOGE">DOGE</option>
          </select>
          <Button onClick={deposit}> Deposit</Button>
        </div>
      </div>

      {/* Play Game */}
      <div className="p-10 border space-y-4 rounded-2xl shadow-2xl w-2xl">
        <h1 className="text-2xl font-bold">Play Game</h1>
        <div className="w-full border rounded-xl border-black">
          <p
            className={`text-2xl text-center py-8 font-semibold rounded-2xl ${
              result.split(" ")[1] === "Won" ? "bg-green-400" : "bg-red-500"
            }`}
          >
            {result}
          </p>
        </div>
        <div className="flex flex-row space-x-5">
          <Input type="number" id="wagerAmount" className="w-2xl" />
          <select
            value={wagerCurrency || ""}
            onChange={(e) => setWagerCurrency(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:border-black"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
            <option value="DOGE">DOGE</option>
          </select>
          <Button onClick={play}> Bet </Button>
        </div>
      </div>

      {/* Withdrwals */}
      <div className="p-10 border rounded-2xl shadow-2xl w-full">
        <h1 className="font-black text-2xl pb-5">Withdraw</h1>
        <div className="flex space-x-5">
          <Input type="number" id="withDrawAmount" className="w-2xl" />
          <select
            value={withdrawCurrency || ""}
            onChange={(e) => setWithdrawCurrency(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:border-black"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
            <option value="DOGE">DOGE</option>
          </select>
          <Button onClick={withdraw}> Withdraw</Button>
        </div>
      </div>

      {/* Event Logs */}
      <div className="p-10 border rounded-2xl shadow-2xl w-full">
        <h1 className="font-black text-2xl">Logs</h1>
      </div>
    </div>
  );
}
