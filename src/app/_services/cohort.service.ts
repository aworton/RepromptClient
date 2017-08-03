import { Injectable } from "@angular/core";
import { Response, RequestOptions, Headers } from "@angular/http"
import { Observable } from 'rxjs/Rx'
import { Paths } from "../app.paths"
import { AuthHttp } from 'angular2-jwt';
import { CohortMemberModel } from "app/_models/cohort-member.model";
import { FileContainer } from "app/_models/file-container.model";
import { ContainerService } from "app/_services/container.service.type";
import { CohortModel } from "app/_models/cohort.model";
import { UserModel } from "app/_models/user.model";

@Injectable()
export class CohortService implements ContainerService{    
    private path = new Paths
    private cohortGetPath = '/api/cohort/'
    private cohortGetAllContainersPath = '/api/cohorts/owned'
    private cohortSavePath = '/api/cohort/'
    private cohortDeletePath = '/api/cohort/'
    private cohortMemberPath = '/api/cohort/member/'
    private userGetPath = '/api/users/'

    constructor(private authHttp: AuthHttp) {
    }

    get(cohortId: number): Observable<any> {
        return this.authHttp.get(this.path.getUrl(this.cohortGetPath) + cohortId)
                            .map(res => res.json())
                            .catch(this.handleError)
    }

    getAllContainers(): Observable<any> {
        return this.authHttp.get(this.path.getUrl(this.cohortGetAllContainersPath))
                            .map(this.handleContainers)
                            .catch(this.handleError)
    }

    save(cohort: FileContainer) {
        return this.authHttp.post(this.path.getUrl(this.cohortSavePath), cohort)
                            .map(this.handleContainer)
                            .catch(this.handleError)
    }

    delete(cohortId: number) {
        return this.authHttp.delete(this.path.getUrl(this.cohortDeletePath) + cohortId)
                            .map(res => res.json())
                            .catch(this.handleError)
    }

    attach(cohortId: number, userId: number) {
        let data = new CohortMemberModel({cohortId: cohortId, userId: userId})
        return this.authHttp.post(this.path.getUrl(this.cohortMemberPath), data)
                            .map(res => res.json())
                            .catch(this.handleError)
    }

    detach(cohortId: number, userId: number) {
        return this.authHttp.delete(this.path.getUrl(this.cohortMemberPath) + cohortId + '/' + userId)
                            .map(res => res.json())
                            .catch(this.handleError)
    }

    getAllItems() {
        return this.authHttp.get(this.path.getUrl(this.userGetPath))
                            .map(res => res.json())
                            .catch(this.handleError)
    }

    private handleContainer(res: Response) {   
        //parse response data into Cohorts
        let cohort = new CohortModel(res.json())
        cohort.members = cohort.members.map(user => new UserModel(user))
        return cohort
    }

    private handleContainers(res: Response) {   
        //parse response data into Cohorts
        let cohorts: CohortModel[] = []
        res.json().forEach(data => {
            let cohort = new CohortModel(data)
            cohort.members = cohort.members.map(user => new UserModel(user))
            cohorts.push(new CohortModel(data))
        })
        return cohorts
    }

    private handleElements(res: Response) {   
        //parse response data into Elements
        let users: UserModel[] = []
        res.json().forEach(data => users.push(new UserModel(data)))
        return users
    }

    private handleError (error: Response | any) {
        console.log("handling error")
        let errMsg: string;
        if (error instanceof Response) {
        const body = error.json() || '';
        const err = body.error || JSON.stringify(body);
        errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
        errMsg = error.message ? error.message : error.toString();
        }
        return Observable.throw(errMsg);
    }

}