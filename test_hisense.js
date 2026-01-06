// Test script to debug Hisense recognition
const brandsData = [
    { keywords: ['samsung', 'samung'], name: 'Samsung' },
    { keywords: ['sony', 'bravia'], name: 'Sony' },
    { keywords: ['hisense', 'hisen'], name: 'Hisense' },
];

function testSearch(inputText) {
    const normalized = inputText.toLowerCase();
    console.log('Testing:', inputText, '-> normalized:', normalized);

    const foundBrand = brandsData.find(b => b.keywords.some(k => normalized.includes(k)));

    if (foundBrand) {
        console.log('✓ Found:', foundBrand.name);
    } else {
        console.log('✗ Not found');
    }
}

testSearch('hisense');
testSearch('Hisense');
testSearch('HISENSE');
testSearch('hisen');
testSearch('samsung');
