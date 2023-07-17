import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Task, TaskAttachment } from '../tasks/task';
import { Tag } from '../models/tag';
import { taskComment } from '../models/task/taskComment';


@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly token = this.getToken();
  private readonly apiUrl = environment.apiUrlDotNet;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${this.token}`
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {
  }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  getAllTasks(skip:string, next: string): Observable<Task[]> {
    return this.http.post<Task[]>(`${this.apiUrl}/task/tasklist`,{skip, next}, this.httpOptions);
  }

  addTask(task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/task/newtask`, task, this.httpOptions);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/task/${id}`, this.httpOptions);
  }

  updateTask(id: string, task: any): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/task/update/${id}`, task, this.httpOptions);
  }

  addUserToTask(taskId: string, user: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/task/newtaskuser`, { taskId, user }, this.httpOptions);
  }

  getTasksByProjectId(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/task/tasklistbyproject/${projectId}`, this.httpOptions);
  }

  deleteTaskUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/task/taskuser/${id}`, this.httpOptions);
  }

  getTaskUsers(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/task/gettaskuserslist/${id}`, this.httpOptions);
  }

  getTasksByUserId(userId: string): Observable<Task[]> {
    return this.http.post<Task[]>(`${this.apiUrl}/task/tasklistbyuser`, { userId }, this.httpOptions);
  }

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/task/tags/0`, this.httpOptions);
  }

  addTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/task/tag/add`, tag, this.httpOptions);
  }
  updatetaskFlex(id, task: any): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrlDotNet}/task/update/${id}`, task, this.httpOptions);
  }

  getTaskByUser(userId): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/task/tasklistbyuser`, { userId }, this.httpOptions);
  }
  updateTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(`${environment.apiUrlDotNet}/task/tag/update`, tag, this.httpOptions);
  }
  deleteTag(tagId: string): Observable<Tag> {
    return this.http.delete<Tag>(`${environment.apiUrlDotNet}/task/tag/${tagId}`, this.httpOptions);
  }

  getTaskById(taskId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/task/${taskId}`, this.httpOptions);
  }
  
  getComments(taskId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/task/comments/${taskId}`, this.httpOptions);
  }

  addComments(comment: taskComment): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/task/comment`, comment, this.httpOptions);
  }

  updateComment(commentId,comment: taskComment): Observable<taskComment> {
    return this.http.put<taskComment>(`${environment.apiUrlDotNet}/task/Comment/${commentId}`, comment,  this.httpOptions);
  }
  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/task/Comment/${commentId}`, this.httpOptions);
  }
  
  addTaskAttachment( taskAttachment): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/task/new/taskattachment`, taskAttachment, this.httpOptions);
  }
  getTaskAttachment(taskId: string):Observable<any>{
    return this.http.get<any>(`${environment.apiUrlDotNet}/task/gettaskattachmentslist/${taskId}`, this.httpOptions);
  }
  deleteTaskAttachment(attachmentId: string):Observable<any>{
    return this.http.delete<any>(`${environment.apiUrlDotNet}/task/taskattachment/${attachmentId}`, this.httpOptions);
  }
  
  getSubTask(taskId: string):Observable<any>{
    return this.http.get<any>(`${environment.apiUrlDotNet}/task/tasklistbyparenttask/${taskId}`, this.httpOptions);
  }
}