from bs4 import BeautifulSoup
import requests
from typing import Optional, Union
from enum import Enum
from pprint import pprint


class Account(Enum):
    ID = "user"
    NAME = "users"


class Repo(Enum):
    ALL = None
    FORKED = True
    OWNED = False


class GitEmail():

    def __init__(self, account: str, account_type: Account = Account.NAME) -> None:
        self.api_base = "https://api.github.com"
        self.account = account
        self.account_type = account_type

    def turn_beautiful(self, response: requests.Response) -> BeautifulSoup:
        return BeautifulSoup(response, "html.parser")

    def get_response(self, url_end: str, args: dict = None) -> Optional[Union[dict, list]]:
        response = requests.get(self.api_base + url_end, params=args).json()
        try:
            response_dict = dict(response)
            if "message" in list(response_dict.keys()):
                return None
            else:
                return response_dict
        except:
            try:
                return list(response)
            except:
                return None

    def convert_to_name(self) -> Optional[str]:
        response_dict = self.get_response(f"/{self.account_type.value}/{self.account}")
        return response_dict["login"] if "login" in response_dict.keys() else None

    def get_user(self) -> Optional[dict]:
        return self.get_response(f"/{self.account_type.value}/{self.account}")

    def get_user_repos(self, repo_type: Repo = Repo.ALL, only_names: bool = False) -> Optional[list]:
        repos = self.get_response(f"/{self.account_type.value}/{self.account}/repos")
        if repo_type.value != None:
            repos = [repo for repo in repos if repo["fork"] == repo_type.value]
        if only_names:
            repos = [repo["name"] for repo in repos]
        return repos

    def get_repo_commits(self, repo: str) -> Optional[list]:
        return self.get_response(f"/repos/{self.account}/{repo}/commits")

    def git_email(self) -> str:
        if not self.get_user():
            print(f"User {self.account} could not be found.")
            return
        repos = self.get_user_repos(repo_type=Repo.OWNED, only_names=True)
        for repo in repos:
            for commit in self.get_repo_commits(repo):
                if commit["author"]["login"] == self.account or commit["author"]["id"] == self.account:
                    return commit["commit"]["author"]["email"]


if __name__ == "__main__":
    pprint(GitEmail("haraldar").git_email())