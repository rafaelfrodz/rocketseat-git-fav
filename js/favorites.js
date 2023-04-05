import { GitHubUser } from "./gitHubUser.js";

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.tbody = this.root.querySelector('table tbody')
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
        this.noFavorite()
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
        
    }

    async add(username) {
        try {
            const userExists = this.entries.find((entry) => entry.login === username)

            if(userExists) {
                throw new Error ('Usuário já favoritado')
            }

            const user = await GitHubUser.search(username)

            if(user.login === undefined) {
                throw new Error('Usuário já favoritado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()
        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter((entry) => entry.login !== user.login)
        this.entries = filteredEntries
        this.update()
        this.save()
        this.noFavorite()
    }
}


// classe responsavel pelo display

export class FavoritesViewer extends Favorites {
    constructor(root) {
        super(root)
        this.update()
        this.onadd()
    }

    noFavorite() {
        const noFavorite = this.root.querySelector('.no-favorite-display')
        const haveRegistereduser = this.entries.length === 0
        if(haveRegistereduser) {
            noFavorite.classList.remove('sr-only')
        } else {
            noFavorite.classList.add('sr-only')
        }
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value)
        }
    }

    update() {
        this.removeAllTr()
        this.noFavorite()
        this.entries.forEach( user => {
            const row = this.createRow()
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').innerHTML = `${user.name}`
            row.querySelector('.user a span').innerHTML = `/${user.login}`
            row.querySelector('.repositories').innerHTML = `${user.public_repos}`
            row.querySelector('.followers').innerHTML = `${user.followers}`

            row.querySelector('.remove').onclick = (e) => {
                const isOk = confirm('Tem certeza que deseja deletar esse usuario?')

                if(isOk) {
                    this.delete(user)
                }
            }
            this.tbody.append(row)
        })
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
        <td class="user">
        <img src="https://github.com/rafaelfrodz.png" alt="" srcset="">
        <a href="https://github.com/rafaelfrodz">
            <p>Rafael César</p>
            <span>rafaelfrodz</span>
        </a>
        </td>
        <td class="repositories">
            123
        </td>
        <td class="followers">
            1234
        </td>
        <td>
            <button class="remove">Remover</button>
        </td>
        `
        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove()
        })
    }

}