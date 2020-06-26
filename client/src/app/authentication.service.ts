import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'


export interface UserDetails {
  _id: string
  email: string
  password: string
  exp: number
  iat: number
  name: string
  roles: string
}

interface TokenResponse {
  token: string
}
export interface TokenPayload {
  _id: string
  email:string
  password: string
  roles:string
}

@Injectable()
export class AuthenticationService {
  public token: string

  constructor(private http: HttpClient, private router: Router, private toastr:ToastrService) {}

  public saveToken(token: string): void {
    localStorage.setItem('usertoken', token)
    this.token = token
  }

  public getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('usertoken')
    }
    return this.token
  }
  
  public getUserDetails(): UserDetails {
    const token = this.getToken()
    let payload
    if (token) {
      payload = token.split('.')[1]
      payload = window.atob(payload)
      return JSON.parse(payload)
    } else {
      return null
    }
  }
  public isLogInAdmin(): boolean {
    const user = this.getUserDetails()
    if (user) {
      if( user.roles==="admin"){
        return user.exp > Date.now() / 1000
      }
    }
      return false
  }

  public isLogInUser(): boolean {
    const user = this.getUserDetails()
    if (user) {
      if( user.roles!='admin'){
        return user.exp > Date.now() / 1000
      }
    }
    return false   
  }

  public login(user: TokenPayload): Observable<any> {
    const base = this.http.post('/users/login', user)
    const request = base.pipe( map((data: TokenResponse) => {
        if (data.token) {
          this.toastr.success('Logged In Successfully!!')
          this.saveToken(data.token)
        }else{
          this.toastr.error("Invalid Credentials");
        }
        return data
      })
    )
    return request
  }

  public profile(): Observable<any> {
    return this.http.get(`/users/profile`, {
      headers: { Authorization: ` ${this.getToken()}` }
    })
  }
public changePswd(_id:string, password:string){
  console.log(password)
  return this.http.put('/users/profile/'+_id,{password:password},{
    headers:{
      Authorization: `${this.getToken()}`
    }
  })
}
  public logout(): void {
    this.toastr.success('Logged Out Successfully!!')
    this.token = ''
    window.localStorage.removeItem('usertoken')
    this.router.navigateByUrl('/')
  }
}