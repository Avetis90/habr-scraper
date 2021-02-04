const puppeteer = require("puppeteer");

module.exports = async (url) => {
    //console.log(url)
    const getEmails = async () => {
        const partnerPage = await browser.newPage();
        await partnerPage.setDefaultNavigationTimeout(0)
        await partnerPage.goto(url, {waitUntil : 'networkidle2' }).catch(e => void 0);
        const email = await partnerPage.evaluate(() => {
                const result = Array.from(document.querySelectorAll("div.contacts .contact"));
                const data = result.map(el => {
                    if (el.querySelector('.type').innerText.trim() === 'Email:') {
                        return el.querySelector('.value a').innerText
                    }
                })
                return data.filter(d => d != null)
            }
        );
        //console.log(email,'email')
        await partnerPage.close();
        return email
    }

    const browser = await puppeteer.launch();

    const emailList = await getEmails();
    let  pages = await browser.pages();
    await Promise.all(pages.map(page =>page.close()));
    await browser.close();
    console.log(emailList,'emailList')
    return emailList
}
