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

    // Kandy-MIM lp token address
    const KandyMimLpTokenAddress = '0x62A6c10dD0fEae68CD245697a1Fa737b720F6446'; // mim-kandy

    // kandy-AVAX lp token address
    const KandyAvaxLpTokenAddress = '0x1a74AF71aE5C4e34a3554261BBAbbc742a424cd2'; // avax-kandy

    // Avax address
    const avaxAddress = '0xd00ae08403b9bbb9124bb305c09058e32c39a48c';

    const daoAddress = '0xe02eb7BDdf5b8bFD3404A8a77B88f9706EC7B225';

    const kandyAddress = '0xaf9Fc588A9860F43236D6b390A538305A26AA81D';

    const mimAddress = '0x7929959Aaa69F313856b2327a2cFAAB5728D8AF3';

    const treasuryAddress = '0x56D43ea61d9098c73E6741912e9BC91B0F3CD9dF';

    const bondingCalculatorAddress = '0x9c3306e1Ba5f04CF98479Ed0BA6eD3684115FC18';

    const distributorAddress = '0x9DF9E5b211C4Ac6D32394A08f1Ff7166aB68728b';
    
    const memoAddress = '0xA9E3340Ef70B2AED56279C73a9191317b7770A54';

    const sKandyAddress = '0x25EbbCC6fb28683C7E6735Ef6ea3F8a478BD5713';

    const stakingAddress = '0x191ea13C0B5Ba9A346681180151f806bA00d4aD2';

    const stakingWarmupAddress = '0x57472459C9F694d2221A8F20c940A9Ac0274830A';

    const stakingHelperAddress = '0xf7a3e183e750A0cEEB5580949122FC24d02fD76a';

    const mimBondAddress = '0xAF2cC7aD895621503C0B76c347377911b1837775';

    const avaxBond = '0x3c9eA1a1c635907988D434f4eF249CDBA2f76e25';

    // Deploy kandy-MIM bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treasury contract
    const KandyBond = await ethers.getContractFactory('KandyBondDepository');
    const kandyBond = await KandyBond.deploy(kandyAddress, KandyMimLpTokenAddress, treasuryAddress, daoAddress, bondingCalculatorAddress);
    console.log("KandyBond deployed on ", kandyBond.address);

    

    // Deploy Kandy-AVAX bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treasury contract
    const KandyAvaxBond = await ethers.getContractFactory('KandyBondDepository');
    const kandyAvaxBond = await KandyAvaxBond.deploy(kandyAddress, KandyAvaxLpTokenAddress, treasuryAddress, daoAddress, bondingCalculatorAddress);
    console.log("KandyAvaxBond deployed on ", kandyAvaxBond.address);

    // queue and toggle MIM and wAvax bond reserve depositor
    const Treasury = await ethers.getContractFactory('KandyTreasury');
    const treasury = await Treasury.attach(treasuryAddress);
    await treasury.queue('4', kandyBond.address);
    await treasury.queue('4', kandyAvaxBond.address);
    await treasury.toggle('4', kandyBond.address, zeroAddress);
    await treasury.toggle('4', kandyAvaxBond.address, zeroAddress);
    console.log("queue and toggle MIM and wAvax bond reserve depositor");

    // Set MIM and wAvax bond terms
    await kandyBond.initializeBondTerms(mimBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVestingLength);
    console.log("Set Kandy-MIM bond terms");
    await kandyAvaxBond.initializeBondTerms(wavaxBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVestingLength);
    console.log("Set Kandy-WAVAX bond terms");

    // Set staking for MIM and wAvax bond
    await kandyBond.setStaking(stakingAddress, 0);
    await kandyBond.setStaking(stakingHelperAddress, 1);
    await kandyAvaxBond.setStaking(stakingAddress, 0);
    await kandyAvaxBond.setStaking(stakingHelperAddress, 1);
    console.log("Set staking for MIM and wAvax bond");

    // Approve mim and wavax bonds to spend deployer's MIM and wAvax
    const MIM = await ethers.getContractFactory('AnyswapV5ERC20');
    const mim = MIM.attach(mimAddress);
    await mim.approve(kandyBond.address, largeApproval );

    console.log("Approved mim and wavax bonds to spend deployer's MIM and wAvax");
    console.log( "KandyMim Bond: ", kandyBond.address );
    console.log( "KandyAvax Bond: ", kandyAvaxBond.address );
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})