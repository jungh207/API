const arenaData = 'https://api.are.na/v3/channels/professors-directory/contents?per=100';

const cardArea = document.getElementById('image-container');
const message = document.getElementById('professor-status');
const subjectMenu = document.getElementById('subject-filter');
const sortMenu = document.getElementById('sort-filter');

let professors = [];

function getLine(text, word) {
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].toLowerCase().startsWith(word + ':')) {
            return lines[i].slice(word.length + 1).trim();
        }
    }

    return '';
}

function makeStars(rating) {
    let stars = '';

    for (let i = 1; i <= 5; i += 1) {
        if (i <= rating) {
            stars += '<span class="star filled">★</span>';
        } else {
            stars += '<span class="star">★</span>';
        }
    }

    return stars;
}

function showCards() {
    let list = professors;

    if (subjectMenu.value === 'pucd') {
        list = list.filter(professor => professor.course.toLowerCase().includes('pucd'));
    }

    if (subjectMenu.value === 'pufy') {
        list = list.filter(professor => professor.course.toLowerCase().includes('pufy'));
    }

    if (sortMenu.value === 'rate') {
        list.sort((a, b) => b.rating - a.rating);
    }

    if (sortMenu.value === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    }

    cardArea.innerHTML = '';
    message.innerText = 'Showing ' + list.length + ' professors from are.na';

    list.forEach(professor => {
        cardArea.innerHTML += `
            <article class="professor-card">
                <h2>${professor.name}</h2>
                <p class="professor-course">${professor.course}</p>
                <div class="star-row">${makeStars(professor.rating)}</div>
                <p class="professor-comment">"${professor.comment}"</p>
            </article>
        `;
    });
}

async function getImages() {
    try {
        const response = await fetch(arenaData);
        const result = await response.json();
        const items = result.data;

        if (!items) {
            message.innerText = 'No items found.';
            return;
        }

        professors = [];

        items.forEach(block => {
            if (block.type === 'Text') {
                const text = block.content.markdown;

                professors.push({
                    name: getLine(text, 'title'),
                    course: getLine(text, 'description'),
                    rating: Number(getLine(text, 'rating')),
                    comment: getLine(text, 'comment')
                });
            }
        });

        showCards();
    } catch (error) {
        console.log(error);
        message.innerText = 'Could not load are.na data.';
    }
}

subjectMenu.addEventListener('change', showCards);
sortMenu.addEventListener('change', showCards);

getImages();
