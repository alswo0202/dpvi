const input_area = document.querySelector(".text-fields")
const input_area_outline = document.querySelector(".input-container-hover")
const body = document.querySelector("body")
const inspect_button = document.querySelector(".inspect-button")
const outputcontainer = document.querySelector(".outputresultcontainer")
const length_counter = document.querySelector(".length-counter")
const advanced_toggle = document.querySelector("#checkbox")
const info_section = document.querySelectorAll(".infotext")

var i = 0;
var txt = '이중피동검사기'; /* The text */
var speed = 200; /* The speed/duration of the effect in milliseconds */

function typeWriter() {
    if (i < txt.length) {
        document.getElementById("typing").innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
    }
}

let dpv_word = []
let dpv_short = []
let dpv_long = []

function init() {
    length_counter.innerText = input_area.value.length
    advanced_toggle.checked = false;
    typeWriter()
}

init()




advanced_toggle.addEventListener("click", () => {
    console.log(advanced_toggle.checked)
    departments = document.querySelectorAll('.dpv-dep')
    if (departments.length > 0) {
        if (advanced_toggle.checked == true) {

            for (let part = 0; part < departments.length; part++) {
                departments[part].classList.remove('invisible')
                departments[part].classList.add('show')
            }
        }
        else {
            for (let part = 0; part < departments.length; part++) {
                departments[part].classList.remove('show')
                departments[part].classList.add('invisible')
            }
        }
    }

})

body.addEventListener("click", (e) => {
    if (e.target.className.split(" ")[0] != "text-fields") {
        input_area_outline.style.borderColor = '#3F72AF';
    }
})

input_area.addEventListener("focus", () => {
    input_area_outline.style.borderColor = '#05b864';
})

input_area.addEventListener("click", () => {
    input_area_outline.style.borderColor = '#05b864';
})

input_area.addEventListener("input", () => {
    length_counter.innerText = input_area.value.length
})

async function postData(url, data = {}) {
    // 옵션 기본 값은 *로 강조
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE 등
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Origin" : "http://alswo0202.github.io/dpvi/",
            "Content-Type": "application/json",
            "Authorization": "b8f5e1c8-e1d2-4973-8567-c7d4bb2fde22"
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
    });
    return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}



inspect_button.addEventListener("click", () => {
    inspect_message = input_area.value;
    postData("http://aiopen.etri.re.kr:8000/WiseNLU", {
        argument: {
            analysis_code: "morp",
            text: inspect_message
        }
    })
        .then((data) => {
            dpv_word = [];
            dpv_short = [];
            dpv_long = [];
            sentences = data.return_object.sentence;
        })
        .then(() => {
            for (let sens = 0; sens < sentences.length; sens++) {
                let morp_in_sentence = sentences[sens].morp
                console.log(morp_in_sentence)
                for (let morps = 0; morps < morp_in_sentence.length; morps++) {
                    if (morp_in_sentence[morps]['type'] == "VV") {
                        if (['이', '히', '리', '기'].includes(morp_in_sentence[morps]['lemma'][1])) {
                            if (['아', '어'].includes(morp_in_sentence[morps + 1]['lemma'])) {
                                if (morp_in_sentence[morps + 2]['lemma'] == '지') {
                                    dpv_word_in_morp = morp_in_sentence[morps]['lemma'] + morp_in_sentence[morps + 1]['lemma'] + morp_in_sentence[morps + 2]['lemma']
                                    dpv_word.push(dpv_word_in_morp)
                                    dpv_short.push(dpv_word_in_morp[dpv_word_in_morp.length - 3])
                                    dpv_long.push(dpv_word_in_morp[dpv_word_in_morp.length - 2] + dpv_word_in_morp[dpv_word_in_morp.length - 1])
                                }
                            }
                        }
                    }
                    else if (morp_in_sentence[morps]['type'] == "NNG") {
                        if (morp_in_sentence[morps + 1]['lemma'] == '되') {
                            if (['아', '어'].includes(morp_in_sentence[morps + 2]['lemma'])) {
                                if (morp_in_sentence[morps + 3]['lemma'] == '지') {
                                    dpv_word_in_morp = morp_in_sentence[morps]['lemma'] + morp_in_sentence[morps + 1]['lemma'] + morp_in_sentence[morps + 2]['lemma'] + morp_in_sentence[morps + 3]['lemma']
                                    dpv_word.push(dpv_word_in_morp)
                                    dpv_short.push(dpv_word_in_morp[dpv_word_in_morp.length - 3])
                                    dpv_long.push(dpv_word_in_morp[dpv_word_in_morp.length - 2] + dpv_word_in_morp[dpv_word_in_morp.length - 1])
                                }
                            }
                        }
                    }

                }
            }
        })
        .then(() => {
            console.log(dpv_word)
            console.log(dpv_short)
            console.log(dpv_long)
        })
        .then(() => {
            simple_mode_result = ""
            for (let dpv_index = 0; dpv_index < dpv_word.length; dpv_index++) {
                simple_mode_result += "'" + dpv_word[dpv_index] + "'"
                if (dpv_index < dpv_word.length - 1) {
                    simple_mode_result += ", "
                }
            }

            if (document.getElementById("result-text")) {
                document.getElementById("result-text").remove()
            }

            simple_mode_result += "가 사용되었습니다."
            g = document.createElement('div');
            g.setAttribute("id", "result-text");
            g.innerText = simple_mode_result;
            outputcontainer.appendChild(g)


            if (document.querySelectorAll(".dpv-dep").length > 0) {
                departments = document.querySelectorAll('.dpv-dep')
                for (let part = 0; part < departments.length; part++) {
                    departments[part].remove()
                }
            }

            for (let dpv_index = 0; dpv_index < dpv_word.length; dpv_index++) {

                dpv_department = document.createElement('div');
                dpv_department.setAttribute("class", "dpv-dep");
                dpv_department.classList.add('invisible')

                dpv_name = document.createElement('div');
                dpv_name.setAttribute("class", "dpv-name");
                dpv_name.innerText = "▶" + dpv_word[dpv_index] + " : ";

                dpv_shortss = document.createElement('div');
                dpv_shortss.setAttribute("class", "dpv-short");
                dpv_shortss.innerText = "파생적 피동 ";

                dpv_connect1 = document.createElement('div');
                dpv_connect1.setAttribute("class", "dpv-name");
                dpv_connect1.innerText = "'" + dpv_short[dpv_index] + "'" + " + ";

                dpv_longss = document.createElement('div');
                dpv_longss.setAttribute("class", "dpv-long");
                dpv_longss.innerText = "통사적 피동 ";

                dpv_connect2 = document.createElement('div');
                dpv_connect2.setAttribute("class", "dpv-name");
                dpv_connect2.innerText = "'" + dpv_long[dpv_index] + "'";

                outputcontainer.appendChild(dpv_department);
                dpv_department.appendChild(dpv_name);
                dpv_department.appendChild(dpv_shortss);
                dpv_department.appendChild(dpv_connect1);
                dpv_department.appendChild(dpv_longss);
                dpv_department.appendChild(dpv_connect2);

                console.log(advanced_toggle.checked)
                departments = document.querySelectorAll('.dpv-dep')
                if (advanced_toggle.checked == true) {

                    for (let part = 0; part < departments.length; part++) {
                        departments[part].classList.remove('invisible')
                        departments[part].classList.add('show')
                    }
                }
                else {
                    for (let part = 0; part < departments.length; part++) {
                        departments[part].classList.remove('show')
                        departments[part].classList.add('invisible')
                    }
                }
            }
        })
        .then(() => {

        })
})
