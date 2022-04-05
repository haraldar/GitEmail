import requests
from typing import Optional, Union
from enum import Enum


class Account(Enum):
    ID = "user"
    NAME = "users"


class Repo(Enum):
    ALL = None
    FORKED = True
    OWNED = False


class GitEmail():
    """Retrieves a given GitHub users' email address."""

    def __init__(self, account: str, account_type: Account = Account.NAME) -> None:
        """The initial function the configures the class values.

        Args:
            account (str): The account name to get the data for.
            account_type (Account, optional): The type of the passed account string. 
            Defaults to Account.NAME.
        """

        self.api_base = "https://api.github.com"
        self.account = account
        self.account_type = account_type

    def get_response(self, url_end: str, args: dict = None) -> Optional[Union[dict, list]]:
        """Makes a get request and returns the response in a valid form.

        Args:
            url_end (str): The part of the url following the base.
            args (dict, optional): The query parameters to send with the request. Defaults to None.

        Returns:
            Optional[Union[dict, list]]: One of the valid forms that match the response JSON layout.
        """

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
        """Converts any of the valid account types to the username.

        Returns:
            Optional[str]: Returns the username if found, otherwise None.
        """

        response_dict = self.get_user()
        return response_dict["login"] if "login" in response_dict.keys() else None

    def get_user(self) -> Optional[dict]:
        """Retrieves the dictionary from GitHub representing the users account.

        Returns:
            Optional[dict]: The user account dictionary if found, else None.
        """

        return self.get_response(f"/{self.account_type.value}/{self.account}")

    def get_user_repos(self, repo_type: Repo = Repo.ALL, only_names: bool = False) -> Optional[list]:
        """Retrieves a list of the users commits to a repository. Optionally filters them by
        repository type and/ or reduces the repository dictionaries to just the names.

        Args:
            repo_type (Repo, optional): The repository type. Defaults to Repo.ALL.
            only_names (bool, optional): The option to reduce the resulting list to just the
            repository names. Defaults to False.

        Returns:
            Optional[list]: The list of the repository dictionaries connected to the users account.
        """

        repos = self.get_response(f"/{self.account_type.value}/{self.account}/repos")
        if repo_type.value != None:
            repos = [repo for repo in repos if repo["fork"] == repo_type.value]
        if only_names:
            repos = [repo["name"] for repo in repos]
        return repos

    def get_repo_commits(self, repo: str) -> Optional[list]:
        """Retrieves a list of the commits of the user to a particular repository.

        Args:
            repo (str): The repository to get the commits of.

        Returns:
            Optional[list]: The list of the commit dictionaries.
        """

        return self.get_response(f"/repos/{self.account}/{repo}/commits")

    def git_email(self) -> str:
        """Gets the GitHub Email for the given user.

        Returns:
            str: The users email.
        """

        if not self.get_user():
            print(f"User {self.account} could not be found.")
            return
        repos = self.get_user_repos(repo_type=Repo.OWNED, only_names=True)
        for repo in repos:
            for commit in self.get_repo_commits(repo):
                if commit["author"]["login"] == self.account or commit["author"]["id"] == self.account:
                    return commit["commit"]["author"]["email"]