// @dev. This script will deploy this V1.1 of KandyLand. It will deploy the whole ecosystem except for the LP tokens and their bonds. 
// This should be enough of a test environment to learn about and test implementations with the kandyland as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'... 
// This solidity function was conflicting w js object property name

const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    // Initial staking index
    const initialIndex = '7675210820';

    // First block epoch occurs
    const firstEpochBlock = '8961000';

    // What epoch will be first epoch
    const firstEpochNumber = '338';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '2200';

    // Initial reward rate for epoch
    const initialRewardRate = '3000';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // Large number for approval for wAvax and MIM
    const largeApproval = '100000000000000000000000000000000';

    // Initial mint for wAvax and MIM (10,000,000)
    const initialMint = '10000000000000000000000000';

    // MIM bond BCV
    const mimBondBCV = '369';

    // wAvax bond BCV
    const wavaxBondBCV = '690';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '33110';

    // Min bond price
    const minBondPrice = '50000';

    // Max bond payout
    const maxBondPayout = '50'

    // DAO fee for bond
    const bondFee = '10000';

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000';

    // Initial Bond debt
    const intialBondDebt = '0';

    // AVAX/USD price feed address
    const avaxUsdPriceFeedAddress = '0x5498BB86BC934c8D34FDA08E81D444153d0D06aD';
    const daoAddress = "0xe02eb7BDdf5b8bFD3404A8a77B88f9706EC7B225";
    const kandyAddress = "0xaf9Fc588A9860F43236D6b390A538305A26AA81D";
    const mimAddress = '0x130966628846BFd36ff31a822705796e8cb8C18D';
    const wavaxAddress = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
    const sKandyAddress = "0x25EbbCC6fb28683C7E6735Ef6ea3F8a478BD5713";
    const wKandyAddress = "0xde2C6A1A6E47752827c15Ad5e4FB4Cdfb0091F7d";
    const bondingCalculatorAddress = "0x9c3306e1Ba5f04CF98479Ed0BA6eD3684115FC18";
    const treasuryAddress = "0x56D43ea61d9098c73E6741912e9BC91B0F3CD9dF";
    const stakingAddress = "0x191ea13C0B5Ba9A346681180151f806bA00d4aD2";
    const stakingHelperAddress = "0xf7a3e183e750A0cEEB5580949122FC24d02fD76a";
    const stakingWarmupAddress = "0x57472459C9F694d2221A8F20c940A9Ac0274830A";
    const distributorAddress = "0x9DF9E5b211C4Ac6D32394A08f1Ff7166aB68728b";
    
    const mimKandyLPTokenAddress = '0x62A6c10dD0fEae68CD245697a1Fa737b720F6446';
    const mimBondAddress = "0xCF2CC69DDd1A36a9bE7Ac08595E3CD06fFcE6C69";
    const mimKandyAddress = "0xADdc2fAb2c09aEE808Efed90f6509Ee6A24ab6aa";
    
    const avaxKandyLPTokenAddress = '0x1a74AF71aE5C4e34a3554261BBAbbc742a424cd2';
    const avaxBondAddress = "0x3c9eA1a1c635907988D434f4eF249CDBA2f76e25";
    const avaxKandyAddress = "0x3A577527C2194258dEcd06d65254d7EAb6af921C";


    // Deploy kandy-MIM bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treasury contract
    const KandyMimBond = await ethers.getContractFactory('KandyBondDepository');
    const kandyMimBond = await KandyMimBond.deploy(kandyAddress, mimKandyLPTokenAddress, treasuryAddress, daoAddress, bondingCalculatorAddress);
    console.log("KandyMimBond deployed on ", kandyMimBond.address);

    // Deploy Kandy-AVAX bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treasury contract
    const KandyAvaxBond = await ethers.getContractFactory('KandyBondDepository');
    const kandyAvaxBond = await KandyAvaxBond.deploy(kandyAddress, avaxKandyLPTokenAddress, treasuryAddress, daoAddress, bondingCalculatorAddress);
    console.log("KandyAvaxBond deployed on ", kandyAvaxBond.address);

    // Deploy KandySale
    const KandySale = await ethers.getContractFactory('KANDYSale');
    const kandySale = await KandySale.deploy();
    console.log("KandySale deployed on ", kandySale.address);

    // Set MIM and wAvax bond terms
    await kandyMimBond.initializeBondTerms(mimBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVestingLength);
    console.log("Set Kandy-MIM bond terms");
    await kandyAvaxBond.initializeBondTerms(wavaxBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVestingLength);
    console.log("Set Kandy-WAVAX bond terms");

     // Set staking for MIM and wAvax bond
     await kandyMimBond.setStaking(stakingAddress, 0);
     await kandyMimBond.setStaking(stakingHelperAddress, 1);
     await kandyAvaxBond.setStaking(stakingAddress, 0);
     await kandyAvaxBond.setStaking(stakingHelperAddress, 1);
     console.log("Set staking for MIM and wAvax bond");

}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})