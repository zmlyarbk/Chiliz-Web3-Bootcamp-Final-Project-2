import NFTDetails from "@/components/NFTDetails";
import Layout from "@/layout/Layout";
import { getMarketplaceContract, getNFTContract } from "@/util/getContracts";
import { useNFT, useValidDirectListings, useTransferNFT } from "@thirdweb-dev/react";
import CancelSellingCard from "@/components/CancelSelling";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useContract } from "@thirdweb-dev/react";
import SellNFTCard from "@/components/SellNFTCard";

function NFTDetailsPage() {
    const router = useRouter();
    const [listingID, setListingID] =useState("");
    const [price, setPrice] = useState(0.01);
    const [symbol, setSymbol] = useState("");
    const [nftID, setNftID] = useState("");
    const [senderContractID, setSenderContractID] = useState("");
    const [receiverContractID, setReceiverContractID] = useState("")
    const {nft_contract} = getNFTContract();
    const {marketplace} = getMarketplaceContract();
    
    const {data: nft, isLoading: isNFTLoading} = useNFT(nft_contract,nftID);
    const{data: directListings} = useValidDirectListings(marketplace, {
        start: 0,
        count:100,
    });
    
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            const { id } = router.query;
            setNftID(id as string);
        }
        let listedNFT = directListings?.find((item) => item.tokenId === nftID);
        if (listedNFT) {
            setListingID(listedNFT.id);
            setPrice(Number(listedNFT.currencyValuePerToken.displayValue));
            setSymbol(listedNFT.currencyValuePerToken.symbol);
        }
    }, [directListings, price, listingID, router.query]);

    const { contract } = useContract(receiverContractID);
    const {
        mutate: transferNFT,
        isLoading,
        error,
    } = useTransferNFT(contract);

    if (error) {
        console.error("NFT transferi başarısız oldu", error);
    }

    return (
        <Layout>
            <div>
                <h1 className="text-6xl font-semibold my-4 text-center">
                    NFT Details
                </h1>

                {isNFTLoading || !nft ? (
                    <div className="text-center">
                        {`Loading NFT with id ${nftID} `}
                    </div>
                ) : (
                    <>
                        <NFTDetails {...nft} />

                        {listingID ? (
                            <CancelSellingCard
                                price={price}
                                symbol={symbol}
                                listingID={listingID}
                            />
                        ) : (
                            <SellNFTCard
                                price={price}
                                onUpdatePrice={setPrice}
                                id={nftID}
                            />
                        )}
                    </>
                )}
                <div>
                    <input 
                    type="text"
                    value = {senderContractID}
                    onChange={(e) => {setSenderContractID(e.target.value)}}
                     />
                     <input 
                    type="text"
                    value = {receiverContractID}
                    onChange={(e) => {setReceiverContractID(e.target.value)}}
                     />
                <button
      disabled={isLoading}
      onClick={() => transferNFT({
        to: senderContractID,
        tokenId: nftID
      })}
    >
      Transfer
    </button>
                </div>
            </div>
        </Layout>
    );
}
export default NFTDetailsPage;